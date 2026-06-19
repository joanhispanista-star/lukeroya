import { useState } from 'react'
import useClientStore from '../store'
import KYC from './KYC'
import './Auth.css'

export default function Auth() {
  const { login } = useClientStore()
  const [tab, setTab] = useState('login')
  const [pending, setPending] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const [ced, setCed] = useState('')
  const [pw, setPw]   = useState('')

  const [rNom, setRNom] = useState('')
  const [rCed, setRCed] = useState('')
  const [rTel, setRTel] = useState('')
  const [rCiu, setRCiu] = useState('')
  const [rPw,  setRPw]  = useState('')
  const [rPw2, setRPw2] = useState('')

  async function doLogin(e) {
    e?.preventDefault()
    setErr('')
    if (!ced || !pw) { setErr('Completa todos los campos'); return }
    setLoading(true)
    const error = await login(ced, pw)
    setLoading(false)
    if (error) setErr(error)
  }

  function doReg(e) {
    e?.preventDefault()
    setErr('')
    if (!rNom || !rCed || !rTel || !rPw) { setErr('Completa todos los campos'); return }
    if (rPw.length < 6) { setErr('Contraseña mínimo 6 caracteres'); return }
    if (rPw !== rPw2)   { setErr('Las contraseñas no coinciden'); return }
    setPending({ cedula: rCed, pass: rPw, nombre: rNom, tel: rTel, ciudad: rCiu })
  }

  if (pending) return <KYC pendingUser={pending} onBack={() => setPending(null)} />

  return (
    <div className="auth-wrap">
      <span className="auth-mascot">🤖</span>
      <div className="auth-logo">LUKERO</div>
      <div className="auth-tag">Tu crédito en minutos · 100% digital</div>

      <div className="auth-card">
        <div className="atabs">
          <button className={`atab${tab === 'login' ? ' on' : ''}`} onClick={() => { setTab('login'); setErr('') }}>Ingresar</button>
          <button className={`atab${tab === 'reg'   ? ' on' : ''}`} onClick={() => { setTab('reg');   setErr('') }}>Registrarse</button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={doLogin}>
            <div className="field"><label>Cédula</label>
              <input type="number" value={ced} onChange={e => setCed(e.target.value)} placeholder="1020304050" />
            </div>
            <div className="field"><label>Contraseña</label>
              <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••" />
            </div>
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'INGRESAR'}</button>
            {err && <div className="err">{err}</div>}
            <div className="auth-foot">¿Nuevo? Usa la pestaña Registrarse</div>
          </form>
        ) : (
          <form onSubmit={doReg}>
            <div className="field"><label>Nombre completo</label>
              <input value={rNom} onChange={e => setRNom(e.target.value)} placeholder="María Fernández" />
            </div>
            <div className="field"><label>Cédula</label>
              <input type="number" value={rCed} onChange={e => setRCed(e.target.value)} placeholder="1020304050" />
            </div>
            <div className="field"><label>Teléfono / WhatsApp</label>
              <input type="tel" value={rTel} onChange={e => setRTel(e.target.value)} placeholder="3001234567" />
            </div>
            <div className="field"><label>Ciudad</label>
              <input value={rCiu} onChange={e => setRCiu(e.target.value)} placeholder="Bogotá" />
            </div>
            <div className="field"><label>Contraseña</label>
              <input type="password" value={rPw} onChange={e => setRPw(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="field"><label>Confirmar</label>
              <input type="password" value={rPw2} onChange={e => setRPw2(e.target.value)} placeholder="Repite tu contraseña" />
            </div>
            <button className="btn" type="submit">CREAR CUENTA</button>
            {err && <div className="err">{err}</div>}
            <div className="auth-foot">Aceptas los T&amp;C de NEXECO SAS</div>
          </form>
        )}
      </div>
    </div>
  )
}
