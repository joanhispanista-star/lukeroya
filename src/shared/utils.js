import { NV, PTS_NIVEL, TECHO_EA, PLAZO_MESES } from './constants'

export const fmt = n => Number(n).toLocaleString('es-CO')
export const fmtCOP = n => '$' + fmt(n)
export const fmtDate = d => new Date(d).toLocaleDateString('es-CO', { weekday:'short', day:'2-digit', month:'short' })

export function capsDisp(lv, puntos) {
  return lv.caps.filter(c => c.p <= puntos)
}
export function capMax(lv, puntos) {
  const d = capsDisp(lv, puntos)
  return d.length ? d[d.length - 1].m : lv.caps[0].m
}

export function ptsEnNivel(user) {
  const before = NV.slice(0, user.nivel - 1).reduce((s, l) => s + l.req, 0) * 300
  return Math.max(0, (user.puntos || 0) - before)
}
export function pctNivel(user) {
  return Math.min(100, Math.round(ptsEnNivel(user) / PTS_NIVEL * 100))
}
export function ptsParaSiguiente(user) {
  return Math.max(0, PTS_NIVEL - ptsEnNivel(user))
}

export async function copyText(text, label = '') {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// Costo (fracción del capital) que corresponde a una Tasa Efectiva Anual
// para un plazo dado en días.  costo = (1 + EA)^(días/365) − 1
export function costoDeEA(ea, dias) {
  if (ea <= 0 || dias <= 0) return 0
  return Math.pow(1 + ea, dias / 365) - 1
}

// Tasa mensual efectiva equivalente a una Tasa Efectiva Anual.
export function tasaMensual(ea) {
  return Math.pow(1 + ea, 1 / 12) - 1
}

// Tasa Efectiva Anual aplicable a un nivel. Con 2 codeudores (garantía) baja.
// TOPE DE SEGURIDAD: nunca devuelve una tasa por encima del techo de usura,
// aunque un nivel esté mal configurado o el techo baje.
export function eaNivel(nivel, conCodeudores = false) {
  const nv = NV[nivel - 1]
  const base = Math.min(nv.ea, TECHO_EA)
  const ea = conCodeudores ? base * 0.75 : base
  return Math.min(ea, TECHO_EA)
}

// Crédito a CUOTAS mensuales (amortización). La Tasa Efectiva Anual del plan es
// EXACTAMENTE eaNivel() → siempre bajo el techo de usura. `meses` >= 3 hace que el
// plazo supere los 60 días (apto para Play Store). Un solo interés, sin cargos ocultos.
export function calcDesglose(capital, nivel, { conCodeudores = false, meses = PLAZO_MESES } = {}) {
  const n = Math.max(3, Math.round(meses))
  const ea = eaNivel(nivel, conCodeudores)
  const im = tasaMensual(ea)
  const cuota = Math.round(capital * im / (1 - Math.pow(1 + im, -n)))
  const total = cuota * n
  const interes = total - capital

  const fechaVence = new Date()
  fechaVence.setMonth(fechaVence.getMonth() + n)

  return { capital, interes, cuota, meses: n, nCuotas: n, total, ea, dias: n * 30, fechaVence, conCodeudores }
}

// Alias retro-compatible.
export function calcCredito(capital, nivel, meses = PLAZO_MESES) {
  return calcDesglose(capital, nivel, { meses })
}
