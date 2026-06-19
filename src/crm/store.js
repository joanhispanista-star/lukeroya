import { create } from 'zustand'
import { CRM_CREDS } from '../shared/constants'
import { loadSolicitudes, saveSolicitudes } from '../shared/storage'

const useCrmStore = create((set, get) => ({
  user: null,
  view: 'dashboard',

  login(rol, user, pass) {
    const cred = CRM_CREDS[rol]
    if (!cred || cred.user !== user || cred.pass !== pass) return 'Credenciales incorrectas'
    set({ user: cred, view: 'dashboard' })
    return null
  },

  logout() { set({ user: null, view: 'dashboard' }) },

  goTo(view) { set({ view }) },

  getSolicitudes() { return loadSolicitudes() },

  updateSolicitud(id, changes) {
    const sols = loadSolicitudes().map(s => s.id === id ? { ...s, ...changes } : s)
    saveSolicitudes(sols)
    set({}) // trigger re-render
  },
}))

export default useCrmStore
