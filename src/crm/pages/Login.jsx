import { useState } from 'react'
import useCrmStore from '../store'
import './Login.css'

const ROLES = ['owner','admin','asesor','ventas']

export default function Login() {
  const { login } = useCrmStore()
  const [rol, setRol] = useState('owner')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')

  function doLogin(e) {
    e.preventDefault()
    setErr('')
    const error = login(rol, user, pass)
    if (error) setErr(error)
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-logo">CRM · Lukero</div>
        <div className="login-sub">Sistema de Cobranzas</div>
        <div className="login-role-tabs">
          {ROLES.map(r => (
            <button key={r} className={rol === r ? 'active' : ''} onClick={() => setRol(r)}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        <form onSubmit={doLogin}>
          <div className="login-field"><label>Usuario</label>
            <input value={user} onChange={e => setUser(e.target.value)} placeholder="usuario" autoFocus />
          </div>
          <div className="login-field"><label>Contraseña</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••" />
          </div>
          <button className="btn-login" type="submit">Ingresar</button>
          {err && <div className="login-err">{err}</div>}
        </form>
      </div>
    </div>
  )
}
