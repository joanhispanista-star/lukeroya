import { useState } from 'react'
import useCrmStore from '../store'
import './Login.css'

export default function Login() {
  const { login } = useCrmStore()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err,  setErr]  = useState('')
  const [loading, setLoading] = useState(false)

  async function doLogin(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    const error = await login(user, pass)
    setLoading(false)
    if (error) setErr(error)
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-logo">CRM · Lukero</div>
        <div className="login-sub">Sistema de Cobranzas</div>
        <form onSubmit={doLogin}>
          <div className="login-field"><label>Usuario</label>
            <input value={user} onChange={e => setUser(e.target.value)} placeholder="owner / admin / asesor1" autoFocus />
          </div>
          <div className="login-field"><label>Contraseña</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••" />
          </div>
          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          {err && <div className="login-err">{err}</div>}
        </form>
      </div>
    </div>
  )
}
