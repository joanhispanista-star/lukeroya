const express = require('express')
const path = require('path')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const app = express()
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

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
  try {
    const exists = await pool.query('SELECT cedula FROM users WHERE cedula = $1', [cedula])
    if (exists.rows.length) return res.status(409).json({ error: 'Cédula ya registrada' })
    const hash = await bcrypt.hash(password, 10)
    const r = await pool.query(
      `INSERT INTO users (cedula, password, nombre, email, telefono)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [cedula, hash, nombre, email || '', telefono || '']
    )
    res.json(toUser(r.rows[0]))
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
    res.json(toSol(r.rows[0]))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── CRM LOGIN ─────────────────────────────────────────────────
app.post('/api/crm/login', (req, res) => {
  const { user, pass } = req.body
  const cred = CRM_CREDS[user]
  if (!cred || cred.pass !== pass) return res.status(401).json({ error: 'Credenciales inválidas' })
  res.json({ user, rol: cred.rol })
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

const PORT = process.env.PORT || 3000
initDB()
  .then(() => app.listen(PORT, () => console.log(`Lukero en puerto ${PORT}`)))
  .catch(e => { console.error('Error DB:', e.message); process.exit(1) })
