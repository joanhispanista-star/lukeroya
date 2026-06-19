import { NV, PTS_NIVEL } from './constants'

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

export function prP(n) {
  return n <= 2 ? .20 : n <= 5 ? .18 : n <= 8 ? .15 : n <= 12 ? .12 : n <= 16 ? .10 : .08
}

export function calcCredito(capital, nivel, prorroga = 0) {
  const nv = NV[nivel - 1]
  const tasa = nv.tasa
  const diasBase = 8
  const dias = diasBase + prorroga * 3

  const interes = Math.round(capital * tasa * 0.40)
  const poliza = Math.round(capital * tasa * 0.20)
  const tech = Math.round(capital * tasa * 0.25 * 1.19)
  const admin = Math.round(capital * tasa * 0.15)
  const total = capital + interes + poliza + tech + admin

  const fechaVence = new Date()
  fechaVence.setDate(fechaVence.getDate() + dias)

  return { capital, total, interes, poliza, tech, admin, dias, fechaVence }
}
