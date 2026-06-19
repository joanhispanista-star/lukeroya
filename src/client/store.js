import { create } from 'zustand'
import { NV, PTS_NIVEL, PTS_PUNTUAL, PTS_ANTICIPADO } from '../shared/constants'
import { ptsEnNivel } from '../shared/utils'

const api = (path, opts = {}) =>
  fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }).then(r => r.json())

const useClientStore = create((set, get) => ({
  user: null,
  screen: 'home',
  toast: null,
  moreOpen: false,

  async login(cedula, password) {
    try {
      const data = await api('/auth/login', { method: 'POST', body: { cedula, password } })
      if (data.error) return data.error
      set({ user: data, screen: 'home' })
      return null
    } catch { return 'Error de conexión' }
  },

  logout() {
    set({ user: null, screen: 'home', moreOpen: false })
  },

  async finishKYC(pendingUser) {
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: {
          cedula: pendingUser.cedula,
          password: pendingUser.pass,
          nombre: pendingUser.nombre,
          email: pendingUser.email || '',
          telefono: pendingUser.tel || '',
        },
      })
      if (data.error) return data.error
      set({ user: data, screen: 'home' })
      return null
    } catch { return 'Error de conexión' }
  },

  nav(screen) {
    set({ screen, moreOpen: false })
  },

  showToast(msg, type = '') {
    set({ toast: { msg, type } })
    setTimeout(() => set({ toast: null }), 3000)
  },

  toggleMore() { set(s => ({ moreOpen: !s.moreOpen })) },
  closeMore()  { set({ moreOpen: false }) },

  async saveUser(updated) {
    const user = updated || get().user
    if (!user) return
    set({ user })
    try {
      await api(`/users/${user.cedula}`, {
        method: 'PUT',
        body: {
          nivel: user.nivel, puntos: user.puntos, creds: user.creds,
          kyc: user.kyc, social: user.social || {},
          credito_activo: user.creditoActivo || null,
          historial: user.historial || [],
          nombre: user.nombre, email: user.email || '',
          telefono: user.telefono || user.tel || '',
        },
      })
    } catch (e) { console.error('saveUser:', e) }
  },

  addPuntos(tipo) {
    const { user, showToast, saveUser } = get()
    if (!user) return
    const map = { puntual: PTS_PUNTUAL, anticipado: PTS_ANTICIPADO, mora: 0, referido: 200 }
    const pts = map[tipo] || 0
    if (!pts) return
    const updated = { ...user, puntos: (user.puntos || 0) + pts }
    while (updated.nivel < 20 && ptsEnNivel(updated) >= PTS_NIVEL) {
      updated.nivel++
      showToast(`🎉 ¡Subiste al nivel ${updated.nivel}! ${NV[updated.nivel - 1].nom}`)
    }
    saveUser(updated)
  },

  claimSocial(red, pts) {
    const { user, showToast, saveUser } = get()
    if (!user) return
    if (user.social?.[red]) { showToast('Ya reclamaste esta red 👍'); return }
    const updated = {
      ...user,
      puntos: (user.puntos || 0) + pts,
      social: { ...user.social, [red]: true },
    }
    saveUser(updated)
    showToast(`+${pts} puntos ganados! 🎉`)
  },

  async submitSolicitud(sol) {
    try {
      await api('/solicitudes', { method: 'POST', body: sol })
    } catch (e) { console.error('submitSolicitud:', e) }
  },
}))

export default useClientStore
