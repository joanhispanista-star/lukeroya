import { AK, CK, DEMO_USER } from './constants'

export function loadUsers() {
  try { return JSON.parse(localStorage.getItem(AK) || '[]') } catch { return [] }
}
export function saveUsers(data) {
  localStorage.setItem(AK, JSON.stringify(data))
}
export function loadSolicitudes() {
  try { return JSON.parse(localStorage.getItem(CK) || '[]') } catch { return [] }
}
export function saveSolicitudes(data) {
  localStorage.setItem(CK, JSON.stringify(data))
}

export function seedDemo() {
  const users = loadUsers()
  if (!users.find(u => u.cedula === DEMO_USER.cedula)) {
    saveUsers([...users, DEMO_USER])
  }
}
