import { create } from 'zustand'
import { NV, PTS_NIVEL, PTS_PUNTUAL, PTS_ANTICIPADO, PTS_PRORROGA } from '../shared/constants'
import { loadUsers, saveUsers, loadSolicitudes, saveSolicitudes } from '../shared/storage'
import { ptsEnNivel } from '../shared/utils'

const useClientStore = create((set, get) => ({
  user: null,
  screen: 'home',
  toast: null,
  moreOpen: false,

  login(cedula, pass) {
    const users = loadUsers()
    const u = users.find(u => u.cedula === cedula && u.pass === pass)
    if (!u) return 'Cédula o contraseña incorrectos'
    set({ user: u, screen: 'home' })
    return null
  },

  logout() {
    set({ user: null, screen: 'home', moreOpen: false })
  },

  register(data) {
    const users = loadUsers()
    if (users.find(u => u.cedula === data.cedula)) return 'Ya existe una cuenta con esa cédula'
    return null
  },

  finishKYC(pendingUser) {
    const users = loadUsers()
    const newUser = { ...pendingUser, kycDone: true }
    saveUsers([...users, newUser])
    set({ user: newUser, screen: 'home' })
  },

  nav(screen) {
    set({ screen, moreOpen: false })
  },

  showToast(msg, type = '') {
    set({ toast: { msg, type } })
    setTimeout(() => set({ toast: null }), 3000)
  },

  toggleMore() {
    set(s => ({ moreOpen: !s.moreOpen }))
  },

  closeMore() {
    set({ moreOpen: false })
  },

  saveUser() {
    const { user } = get()
    if (!user) return
    const users = loadUsers()
    const i = users.findIndex(u => u.cedula === user.cedula)
    if (i >= 0) users[i] = user
    else users.push(user)
    saveUsers(users)
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
    set({ user: updated })
    saveUser()
  },

  claimSocial(red, pts) {
    const { user, showToast, saveUser } = get()
    if (!user) return
    if (user.sc?.[red]) { showToast('Ya reclamaste esta red 👍'); return }
    const updated = {
      ...user,
      puntos: (user.puntos || 0) + pts,
      sc: { ...user.sc, [red]: true },
    }
    set({ user: updated })
    saveUser()
    showToast(`+${pts} puntos ganados! 🎉`)
  },

  submitSolicitud(sol) {
    const sols = loadSolicitudes()
    sols.push(sol)
    saveSolicitudes(sols)
  },
}))

export default useClientStore
