// lib/plazaReputacion.js
// Fase 1 · Lukero → Plaza. Cuando un crédito se paga o entra en mora, Lukero
// reporta el evento a la reputación de Plaza vía la Edge Function por cédula.
// Plaza hashea la cédula y resuelve el user_id; Lukero no maneja user_ids.
//
// Requiere en el entorno (Render env vars):
//   PLAZA_SUPABASE_URL   = https://TU_PROYECTO.supabase.co
//   PLAZA_WEBHOOK_SECRET = el mismo secreto que en Plaza (x-plaza-secret)
//
// Es a prueba de fallos: si Plaza está caído o el cliente aún no hizo KYC en
// Plaza, se registra y se sigue. NUNCA rompe el flujo de Lukero.

const PLAZA_URL = process.env.PLAZA_SUPABASE_URL
const PLAZA_SECRET = process.env.PLAZA_WEBHOOK_SECRET

// ── Fechas ────────────────────────────────────────────────────
// fecha_vence se guarda con toLocaleDateString('es-CO') → "D/M/AAAA" (día primero),
// que new Date() interpreta mal. Parseamos a mano; aceptamos ISO por compatibilidad.
function parseFechaVence(text) {
  if (!text) return null
  if (text.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(text)) {
    const d = new Date(text)
    return isNaN(d.getTime()) ? null : d
  }
  const m = String(text).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
}

// Días enteros vencidos (hoy − vence). Negativo = aún no vence.
function diasVencido(fechaVence, hoy = new Date()) {
  const a = Date.UTC(fechaVence.getFullYear(), fechaVence.getMonth(), fechaVence.getDate())
  const b = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  return Math.floor((b - a) / 86400000)
}

// Tipo de pago según la fecha de vencimiento (el pago nunca se penaliza).
function tipoPago(fechaVenceText) {
  const fv = parseFechaVence(fechaVenceText)
  if (!fv) return 'pago_a_tiempo'
  return diasVencido(fv) < 0 ? 'pago_anticipado' : 'pago_a_tiempo'
}

// Días de mora (>= 0) de una solicitud, para escoger leve/grave.
function diasMora(fechaVenceText) {
  const fv = parseFechaVence(fechaVenceText)
  if (!fv) return 0
  return Math.max(0, diasVencido(fv))
}

function tipoMoraPorDias(dias) {
  if (dias >= 9) return 'mora_grave'
  if (dias >= 1) return 'mora_leve'
  return null
}

// ── Webhook ───────────────────────────────────────────────────
async function enviarEventoPlaza({ cedula, tipo, referencia = null, metadata = {} }) {
  if (!PLAZA_URL || !PLAZA_SECRET) return { ok: false, motivo: 'sin_configurar' }
  if (!cedula || !tipo) return { ok: false, motivo: 'faltan_datos' }
  try {
    const res = await fetch(`${PLAZA_URL}/functions/v1/evento-por-cedula`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-plaza-secret': PLAZA_SECRET },
      body: JSON.stringify({ cedula, tipo, origen: 'lukero', referencia, metadata }),
    })
    if (res.status === 404) return { ok: false, motivo: 'sin_kyc_en_plaza' } // normal, no es error
    if (!res.ok) {
      console.error('[plaza] evento rechazado', res.status, await res.text().catch(() => ''))
      return { ok: false, motivo: 'rechazado', status: res.status }
    }
    return { ok: true }
  } catch (e) {
    console.error('[plaza] no se pudo enviar evento:', e.message)
    return { ok: false, motivo: 'red', error: e.message }
  }
}

// ── Barrido de mora ───────────────────────────────────────────
// Recorre solicitudes desembolsadas vencidas, marca 'mora' localmente y reporta
// a Plaza. Idempotente: Plaza ignora duplicados por (tipo, referencia=id), así
// que puede correr a diario sin volver a penalizar el mismo crédito.
async function barrerMora(pool) {
  const { rows } = await pool.query(
    `SELECT id, cedula, fecha_vence, estado FROM solicitudes WHERE estado IN ('activo','mora')`
  )
  let marcadas = 0, leves = 0, graves = 0
  for (const s of rows) {
    const fv = parseFechaVence(s.fecha_vence)
    if (!fv) continue
    const dias = diasVencido(fv)
    const tipo = tipoMoraPorDias(dias)
    if (!tipo) continue
    if (s.estado === 'activo') {
      try {
        await pool.query(`UPDATE solicitudes SET estado='mora' WHERE id=$1`, [s.id])
        marcadas++
      } catch (e) {
        console.error('[plaza] no se pudo marcar mora local', s.id, e.message)
      }
    }
    await enviarEventoPlaza({ cedula: s.cedula, tipo, referencia: s.id, metadata: { dias_mora: dias } })
    if (tipo === 'mora_grave') graves++
    else leves++
  }
  console.log(`[plaza] barrido mora: ${rows.length} revisadas, ${marcadas} marcadas, ${leves} leve(s), ${graves} grave(s)`)
  return { revisadas: rows.length, marcadas, leves, graves }
}

module.exports = {
  enviarEventoPlaza,
  barrerMora,
  tipoPago,
  diasMora,
  tipoMoraPorDias,
  parseFechaVence,
  diasVencido,
}
