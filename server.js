require('dotenv').config()
const express = require('express')
const path = require('path')
const bcrypt = require('bcryptjs')
const cron = require('node-cron')
const { enviarEventoPlaza, barrerMora, tipoPago, diasMora, tipoMoraPorDias } = require('./lib/plazaReputacion')

const app = express()
app.use(express.json())

// Base de datos:
//  • Con DATABASE_URL  → PostgreSQL real (Render). SSL para remotas, sin SSL para localhost.
//  • Sin DATABASE_URL  → base EN MEMORIA (pg-mem) para desarrollo local sin instalar nada.
const dbUrl = process.env.DATABASE_URL || ''
let pool
if (dbUrl) {
  const { Pool } = require('pg')
  const dbEsLocal = /localhost|127\.0\.0\.1/.test(dbUrl)
  pool = new Pool({ connectionString: dbUrl, ssl: dbEsLocal ? false : { rejectUnauthorized: false } })
  console.log('DB: PostgreSQL', dbEsLocal ? 'local' : 'remoto (Render)')
} else {
  const { newDb } = require('pg-mem')
  const { Pool } = newDb().adapters.createPg()
  pool = new Pool()
  console.log('DB: EN MEMORIA (pg-mem) — sin DATABASE_URL. Los datos se reinician al reiniciar el servidor.')
}

const CRM_CREDS = {
  owner:   { pass: 'owner123',  rol: 'owner'  },
  admin:   { pass: 'admin123',  rol: 'admin'  },
  asesor1: { pass: 'asesor123', rol: 'asesor' },
  ventas1: { pass: 'ventas123', rol: 'ventas' },
}

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      cedula      TEXT PRIMARY KEY,
      password    TEXT NOT NULL,
      nombre      TEXT NOT NULL,
      email       TEXT DEFAULT '',
      telefono    TEXT DEFAULT '',
      nivel       INTEGER DEFAULT 1,
      puntos      INTEGER DEFAULT 0,
      creds       INTEGER DEFAULT 0,
      kyc         BOOLEAN DEFAULT FALSE,
      social      JSONB DEFAULT '{}',
      credito_activo JSONB,
      historial   JSONB DEFAULT '[]',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS solicitudes (
      id          TEXT PRIMARY KEY,
      cedula      TEXT NOT NULL,
      nombre      TEXT,
      monto       INTEGER,
      plazo       INTEGER,
      tasa        NUMERIC,
      total_pagar NUMERIC,
      fecha_sol   TIMESTAMPTZ DEFAULT NOW(),
      fecha_vence TEXT,
      estado      TEXT DEFAULT 'pendiente',
      capital     INTEGER,
      prorrogas   INTEGER DEFAULT 0,
      nivel       INTEGER
    );
    CREATE TABLE IF NOT EXISTS comentarios (
      id          TEXT PRIMARY KEY,
      cedula      TEXT DEFAULT '',
      nombre      TEXT,
      texto       TEXT NOT NULL,
      estrellas   INTEGER DEFAULT 5,
      red_social  TEXT DEFAULT '',
      destacado   BOOLEAN DEFAULT FALSE,
      fecha       TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS codigos_acceso (
      codigo          TEXT PRIMARY KEY,
      nota            TEXT DEFAULT '',
      cedula_asignada TEXT DEFAULT '',
      usado           BOOLEAN DEFAULT FALSE,
      usado_por       TEXT DEFAULT '',
      creado_por      TEXT DEFAULT '',
      fecha_creado    TIMESTAMPTZ DEFAULT NOW(),
      fecha_usado     TIMESTAMPTZ
    );
  `)

  const demo = await pool.query('SELECT cedula FROM users WHERE cedula = $1', ['1234567890'])
  if (demo.rows.length === 0) {
    const hash = await bcrypt.hash('demo123', 10)
    await pool.query(
      `INSERT INTO users (cedula, password, nombre, email, telefono, nivel, puntos, creds, kyc, social)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      ['1234567890', hash, 'María González', 'maria@example.com', '3001234567', 3, 1500, 2, true, JSON.stringify({ ig: true, tk: false, fb: true, yt: false })]
    )
  }

  const coms = await pool.query('SELECT COUNT(*)::int AS n FROM comentarios')
  if (coms.rows[0].n === 0) {
    const seed = [
      ['c_seed1', 'Carlos M.',  'Me aprobaron en 10 minutos sin vueltas ni papeleo. Ya voy en mi cuarto crédito y me subieron el cupo.', 5, '@carlosm'],
      ['c_seed2', 'Andrea R.',  'Al principio desconfiaba, pero pagué a tiempo y todo fue transparente. Con codeudores me salió mucho más barato.', 5, '@andre.r'],
      ['c_seed3', 'Julián P.',  'Necesitaba plata para surtir mi negocio un domingo y Lukero me salvó. Subir de nivel sí vale la pena.', 5, '@julianp'],
      ['c_seed4', 'Diana G.',   'Excelente servicio, la app es muy fácil y Luka me resolvió todas las dudas. 100% recomendado.', 4, '@dianag'],
    ]
    for (const [id, nombre, texto, estrellas, red] of seed) {
      await pool.query(
        `INSERT INTO comentarios (id, nombre, texto, estrellas, red_social, destacado) VALUES ($1,$2,$3,$4,$5,TRUE)`,
        [id, nombre, texto, estrellas, red]
      )
    }
  }

  console.log('DB lista')
}

// ── AUTH CLIENTE ──────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { cedula, password } = req.body
  try {
    const r = await pool.query('SELECT * FROM users WHERE cedula = $1', [cedula])
    if (!r.rows.length) return res.status(401).json({ error: 'Cédula no registrada' })
    const user = r.rows[0]
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Contraseña incorrecta' })
    res.json(toUser(user))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/auth/register', async (req, res) => {
  const { cedula, password, nombre, email, telefono } = req.body
  const cod = (req.body.codigo || '').trim().toUpperCase()
  try {
    const exists = await pool.query('SELECT cedula FROM users WHERE cedula = $1', [cedula])
    if (exists.rows.length) return res.status(409).json({ error: 'Cédula ya registrada' })

    // Reclamar el código de acceso de forma atómica: solo si existe, no se ha usado,
    // y (si está asignado a una cédula) coincide. Así un código sirve una sola vez.
    const claim = await pool.query(
      `UPDATE codigos_acceso SET usado = TRUE, usado_por = $1, fecha_usado = NOW()
       WHERE codigo = $2 AND usado = FALSE AND (cedula_asignada = '' OR cedula_asignada = $1)
       RETURNING codigo`,
      [cedula, cod]
    )
    if (!claim.rows.length) return res.status(403).json({ error: 'Código de acceso no válido o ya usado' })

    const hash = await bcrypt.hash(password, 10)
    try {
      const r = await pool.query(
        `INSERT INTO users (cedula, password, nombre, email, telefono)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [cedula, hash, nombre, email || '', telefono || '']
      )
      res.json(toUser(r.rows[0]))
    } catch (e) {
      // Si falla crear el usuario, liberar el código para que no se pierda.
      await pool.query('UPDATE codigos_acceso SET usado = FALSE, usado_por = \'\', fecha_usado = NULL WHERE codigo = $1', [cod])
      throw e
    }
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── OTP / VERIFICACIÓN WHATSAPP (Twilio Verify) ───────────────
// Con las 3 env vars puestas → WhatsApp/SMS real. Sin ellas → modo demo
// (devuelve el código y el frontend lo muestra en un aviso, como antes).
const twilioOn = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SID)

// Normaliza un teléfono colombiano a formato E.164 (+57XXXXXXXXXX)
function normalizeCO(tel) {
  let t = String(tel || '').replace(/\D/g, '')
  if (t.startsWith('57') && t.length === 12) return '+' + t
  if (t.length === 10) return '+57' + t
  return '+' + t
}

async function twilioVerify(pathSuffix, params) {
  const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')
  const r = await fetch(
    `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SID}/${pathSuffix}`,
    { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params) }
  )
  const j = await r.json()
  if (!r.ok) throw new Error(j.message || `Twilio ${r.status}`)
  return j
}

// Enviar código. body: { tel, email, channel: 'whatsapp' | 'sms' | 'email' }
app.post('/api/otp/send', async (req, res) => {
  const ch = req.body.channel || 'whatsapp'
  try {
    // Email todavía en modo demo; sin Twilio configurado todo cae a demo.
    if (ch === 'email' || !twilioOn) {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      return res.json({ mode: 'demo', code })
    }
    const to = normalizeCO(req.body.tel)
    await twilioVerify('Verifications', { To: to, Channel: ch })
    res.json({ mode: ch })
  } catch (e) { res.status(502).json({ error: 'No se pudo enviar el código: ' + e.message }) }
})

// Verificar código. body: { tel, code, channel }
app.post('/api/otp/check', async (req, res) => {
  const ch = req.body.channel || 'whatsapp'
  try {
    if (ch === 'email' || !twilioOn) return res.json({ ok: false, demo: true })
    const to = normalizeCO(req.body.tel)
    const r = await twilioVerify('VerificationCheck', { To: to, Code: req.body.code })
    res.json({ ok: r.status === 'approved' })
  } catch (e) { res.status(502).json({ error: e.message }) }
})

// ── CÓDIGOS DE ACCESO (invitación, un solo uso) ───────────────
const toCodigo = r => ({
  codigo: r.codigo, nota: r.nota, cedulaAsignada: r.cedula_asignada,
  usado: r.usado, usadoPor: r.usado_por, creadoPor: r.creado_por,
  fechaCreado: r.fecha_creado, fechaUsado: r.fecha_usado,
})

// Genera un código legible (sin caracteres ambiguos: nada de O/0, I/1, L).
function genCodigo() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)]
  return 'LKR-' + s
}

// Generar un código (CRM)
app.post('/api/codigos', async (req, res) => {
  const { nota, cedula, creadoPor } = req.body
  try {
    let codigo
    for (let i = 0; ; i++) {
      codigo = genCodigo()
      const ex = await pool.query('SELECT 1 FROM codigos_acceso WHERE codigo = $1', [codigo])
      if (!ex.rows.length) break
      if (i > 6) return res.status(500).json({ error: 'No se pudo generar un código único' })
    }
    const r = await pool.query(
      `INSERT INTO codigos_acceso (codigo, nota, cedula_asignada, creado_por)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [codigo, (nota || '').trim(), (cedula || '').trim(), (creadoPor || '').trim()]
    )
    res.json(toCodigo(r.rows[0]))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Listar códigos (CRM)
app.get('/api/codigos', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM codigos_acceso ORDER BY fecha_creado DESC')
    res.json(r.rows.map(toCodigo))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Borrar un código sin usar (CRM)
app.delete('/api/codigos/:codigo', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM codigos_acceso WHERE codigo = $1 AND usado = FALSE RETURNING codigo', [req.params.codigo])
    if (!r.rows.length) return res.status(400).json({ error: 'No se puede borrar (no existe o ya fue usado)' })
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Validar un código sin consumirlo (feedback durante el registro)
app.post('/api/codigos/validar', async (req, res) => {
  const codigo = (req.body.codigo || '').trim().toUpperCase()
  const cedula = (req.body.cedula || '').trim()
  try {
    const r = await pool.query('SELECT * FROM codigos_acceso WHERE codigo = $1', [codigo])
    if (!r.rows.length) return res.status(404).json({ error: 'Código no válido' })
    const c = r.rows[0]
    if (c.usado) return res.status(409).json({ error: 'Ese código ya fue usado' })
    if (c.cedula_asignada && c.cedula_asignada !== cedula) return res.status(403).json({ error: 'Ese código es para otra cédula' })
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── USUARIOS ──────────────────────────────────────────────────
app.get('/api/users/:cedula', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM users WHERE cedula = $1', [req.params.cedula])
    if (!r.rows.length) return res.status(404).json({ error: 'No encontrado' })
    res.json(toUser(r.rows[0]))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/users/:cedula', async (req, res) => {
  const { nivel, puntos, creds, kyc, social, credito_activo, historial, nombre, email, telefono } = req.body
  try {
    const r = await pool.query(
      `UPDATE users SET
        nivel=$2, puntos=$3, creds=$4, kyc=$5,
        social=$6, credito_activo=$7, historial=$8,
        nombre=$9, email=$10, telefono=$11
       WHERE cedula=$1 RETURNING *`,
      [req.params.cedula, nivel, puntos, creds, kyc,
       JSON.stringify(social), credito_activo ? JSON.stringify(credito_activo) : null,
       JSON.stringify(historial), nombre, email, telefono]
    )
    res.json(toUser(r.rows[0]))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/users', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM users ORDER BY created_at DESC')
    res.json(r.rows.map(toUser))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── SOLICITUDES ───────────────────────────────────────────────
app.post('/api/solicitudes', async (req, res) => {
  const { id, cedula, nombre, monto, plazo, tasa, totalPagar, fechaVence, capital, nivel } = req.body
  try {
    const r = await pool.query(
      `INSERT INTO solicitudes (id, cedula, nombre, monto, plazo, tasa, total_pagar, fecha_vence, capital, nivel)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, cedula, nombre, monto, plazo, tasa, totalPagar, fechaVence, capital, nivel]
    )
    res.json(toSol(r.rows[0]))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/solicitudes', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM solicitudes ORDER BY fecha_sol DESC')
    res.json(r.rows.map(toSol))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/solicitudes/user/:cedula', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM solicitudes WHERE cedula=$1 ORDER BY fecha_sol DESC', [req.params.cedula])
    res.json(r.rows.map(toSol))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.patch('/api/solicitudes/:id', async (req, res) => {
  const { estado, prorrogas } = req.body
  try {
    const sets = []
    const vals = [req.params.id]
    if (estado !== undefined)    { vals.push(estado);    sets.push(`estado=$${vals.length}`) }
    if (prorrogas !== undefined) { vals.push(prorrogas); sets.push(`prorrogas=$${vals.length}`) }
    if (!sets.length) return res.status(400).json({ error: 'Nada que actualizar' })
    const r = await pool.query(`UPDATE solicitudes SET ${sets.join(',')} WHERE id=$1 RETURNING *`, vals)
    const sol = r.rows[0]
    res.json(toSol(sol))

    // Fase 1 · Plaza: reporta el cambio de estado a la reputación (fire-and-forget,
    // no bloquea ni rompe la respuesta). Idempotente en Plaza por referencia=id.
    if (sol && estado === 'pagado') {
      enviarEventoPlaza({ cedula: sol.cedula, tipo: tipoPago(sol.fecha_vence),
        referencia: sol.id, metadata: { monto: sol.total_pagar } })
    } else if (sol && estado === 'mora') {
      const dias = diasMora(sol.fecha_vence)
      enviarEventoPlaza({ cedula: sol.cedula, tipo: tipoMoraPorDias(dias) || 'mora_leve',
        referencia: sol.id, metadata: { dias_mora: dias } })
    }
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Barrido de mora bajo demanda (respaldo del cron). Lo puede pegar un scheduler
// externo (Render Cron, cron-job.org) con el header x-cron-secret.
app.post('/api/cron/barrer-mora', async (req, res) => {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  try {
    res.json(await barrerMora(pool))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── CRM LOGIN ─────────────────────────────────────────────────
app.post('/api/crm/login', (req, res) => {
  const { user, pass } = req.body
  const cred = CRM_CREDS[user]
  if (!cred || cred.pass !== pass) return res.status(401).json({ error: 'Credenciales inválidas' })
  res.json({ user, rol: cred.rol })
})

// ── COMENTARIOS / TESTIMONIOS ─────────────────────────────────
app.get('/api/comentarios', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM comentarios ORDER BY destacado DESC, fecha DESC')
    res.json(r.rows.map(toCom))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/comentarios', async (req, res) => {
  const { cedula, nombre, texto, estrellas, redSocial } = req.body
  if (!texto || !texto.trim()) return res.status(400).json({ error: 'El comentario está vacío' })
  try {
    const id = 'c_' + Date.now()
    const est = Math.max(1, Math.min(5, parseInt(estrellas, 10) || 5))
    const r = await pool.query(
      `INSERT INTO comentarios (id, cedula, nombre, texto, estrellas, red_social)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [id, cedula || '', nombre || 'Cliente Lukero', texto.trim().slice(0, 500), est, (redSocial || '').slice(0, 60)]
    )
    res.json(toCom(r.rows[0]))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── AI PROXY ──────────────────────────────────────────────────
app.post('/api/claude', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    })
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── STATIC ────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

function toUser(r) {
  return {
    cedula: r.cedula, nombre: r.nombre, email: r.email,
    telefono: r.telefono, nivel: r.nivel, puntos: r.puntos,
    creds: r.creds, kyc: r.kyc, social: r.social,
    creditoActivo: r.credito_activo, historial: r.historial,
  }
}

function toSol(r) {
  return {
    id: r.id, cedula: r.cedula, nombre: r.nombre,
    monto: r.monto, plazo: r.plazo, tasa: r.tasa,
    totalPagar: r.total_pagar, fechaSol: r.fecha_sol,
    fechaVence: r.fecha_vence, estado: r.estado,
    capital: r.capital, prorrogas: r.prorrogas, nivel: r.nivel,
  }
}

function toCom(r) {
  return {
    id: r.id, cedula: r.cedula, nombre: r.nombre, texto: r.texto,
    estrellas: r.estrellas, redSocial: r.red_social,
    destacado: r.destacado, fecha: r.fecha,
  }
}

// Barrido diario de mora a las 06:00 (hora Colombia). En Render Free el servicio
// puede dormir; si no corre, dispáralo con POST /api/cron/barrer-mora.
cron.schedule('0 6 * * *', () => {
  barrerMora(pool).catch(e => console.error('[plaza] barrido falló:', e.message))
}, { timezone: 'America/Bogota' })

const PORT = process.env.PORT || 3000
initDB()
  .then(() => app.listen(PORT, () => console.log(`Lukero en puerto ${PORT}`)))
  .catch(e => { console.error('Error DB:', e.message); process.exit(1) })
