import { create } from 'zustand'

const api = (path, opts = {}) =>
  fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }).then(r => r.json())

const useCrmStore = create((set, get) => ({
  user: null,
  view: 'dashboard',
  solicitudes: [],
  clientes: [],
  comentarios: [],
  codigos: [],

  async login(user, pass) {
    try {
      const data = await api('/crm/login', { method: 'POST', body: { user, pass } })
      if (data.error) return data.error
      set({ user: data, view: 'dashboard' })
      return null
    } catch { return 'Error de conexión' }
  },

  logout() {
    set({ user: null, view: 'dashboard', solicitudes: [], clientes: [] })
  },

  goTo(view) { set({ view }) },

  async fetchSolicitudes() {
    try {
      const data = await api('/solicitudes')
      if (Array.isArray(data)) set({ solicitudes: data })
    } catch (e) { console.error('fetchSolicitudes:', e) }
  },

  async fetchClientes() {
    try {
      const data = await api('/users')
      if (Array.isArray(data)) set({ clientes: data })
    } catch (e) { console.error('fetchClientes:', e) }
  },

  async fetchComentarios() {
    try {
      const data = await api('/comentarios')
      if (Array.isArray(data)) set({ comentarios: data })
    } catch (e) { console.error('fetchComentarios:', e) }
  },

  async updateSolicitud(id, changes) {
    try {
      await api(`/solicitudes/${id}`, { method: 'PATCH', body: changes })
      get().fetchSolicitudes()
    } catch (e) { console.error('updateSolicitud:', e) }
  },

  async fetchCodigos() {
    try {
      const data = await api('/codigos')
      if (Array.isArray(data)) set({ codigos: data })
    } catch (e) { console.error('fetchCodigos:', e) }
  },

  async generarCodigo(body) {
    try {
      const data = await api('/codigos', { method: 'POST', body })
      if (data.error) return { error: data.error }
      get().fetchCodigos()
      return data
    } catch { return { error: 'Error de conexión' } }
  },

  async revocarCodigo(codigo) {
    try {
      const data = await api(`/codigos/${codigo}`, { method: 'DELETE' })
      get().fetchCodigos()
      return data.error ? data.error : null
    } catch { return 'Error de conexión' }
  },
}))

export default useCrmStore
