import { NV, PTS_NIVEL, TECHO_EA, PLAZO_DIAS, PRORROGA_DIAS } from './constants'

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

// Tasa Efectiva Anual aplicable a un nivel. Con 2 codeudores (garantía) baja.
// TOPE DE SEGURIDAD: nunca devuelve una tasa por encima del techo de usura,
// aunque un nivel esté mal configurado o el techo baje.
export function eaNivel(nivel, conCodeudores = false) {
  const nv = NV[nivel - 1]
  const base = Math.min(nv.ea, TECHO_EA)
  const ea = conCodeudores ? base * 0.75 : base
  return Math.min(ea, TECHO_EA)
}

// Costo del crédito: un ÚNICO interés transparente, sin cargos fragmentados,
// calculado por la Tasa Efectiva Anual del nivel. Siempre bajo el techo de usura.
export function calcDesglose(capital, nivel, { conCodeudores = false, prorroga = 0, dias = PLAZO_DIAS } = {}) {
  const totalDias = dias + prorroga * PRORROGA_DIAS
  const ea = eaNivel(nivel, conCodeudores)
  const interes = Math.round(capital * costoDeEA(ea, totalDias))
  const total = capital + interes

  const fechaVence = new Date()
  fechaVence.setDate(fechaVence.getDate() + totalDias)

  return { capital, interes, cobro: interes, total, dias: totalDias, ea, fechaVence, conCodeudores }
}

// Alias retro-compatible.
export function calcCredito(capital, nivel, prorroga = 0) {
  return calcDesglose(capital, nivel, { prorroga })
}
