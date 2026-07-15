import { useState } from 'react'
import useClientStore from '../store'
import { NV } from '../../shared/constants'
import { fmtCOP, capsDisp, calcDesglose } from '../../shared/utils'
import './Solicitar.css'

export default function Solicitar() {
  const { user, nav, showToast, submitSolicitud } = useClientStore()
  const [done, setDone] = useState(false)
  const [okMsg, setOkMsg] = useState('')
  const [loading, setLoading] = useState(false)
  if (!user) return null

  const nv   = NV[user.nivel - 1]
  const caps = capsDisp(nv, user.puntos || 0)
  const [selCap, setSelCap] = useState(caps[0]?.m || nv.caps[0].m)
  const [conCodeudores, setConCodeudores] = useState(false)
  const calc = calcDesglose(selCap, user.nivel, { conCodeudores })

  async function handleSolicitar() {
    setLoading(true)
    const sol = {
      id:         'sol_' + Date.now(),
      cedula:     user.cedula,
      nombre:     user.nombre,
      monto:      selCap,
      plazo:      calc.dias,
      tasa:       calc.ea,
      totalPagar: calc.total,
      fechaVence: calc.fechaVence.toLocaleDateString('es-CO'),
      capital:    selCap,
      nivel:      user.nivel,
      codeudores: conCodeudores,
      estado:     'pendiente',
    }
    await submitSolicitud(sol)
    setLoading(false)
    setOkMsg(`Tu solicitud de ${fmtCOP(selCap)} fue enviada. Un asesor te contactará pronto por WhatsApp.`)
    setDone(true)
    showToast('¡Solicitud enviada! 🎉')
  }

  if (done) return (
    <div className="screen-inner">
      <div className="sol-ok">
        <div style={{ fontSize:52, marginBottom:12 }}>✅</div>
        <h3>¡Solicitud enviada!</h3>
        <p>{okMsg}</p>
        <button className="btna" style={{ maxWidth:240, marginTop:18 }} onClick={() => nav('home')}>← Volver al inicio</button>
      </div>
    </div>
  )

  return (
    <div className="screen-inner">
      <nav className="topnav" style={{ cursor:'pointer' }} onClick={() => nav('home')}>
        <div className="nav-logo">‹ Volver</div>
      </nav>
      <div className="pw">
        <div className="ctitle">💳 Tu solicitud</div>
        <div className="card">
          <div className="slbl">Monto</div>
          <div className="capg">
            {caps.map(c => (
              <button key={c.m} className={`capbtn${selCap===c.m?' active':''}`} onClick={() => setSelCap(c.m)}>{fmtCOP(c.m)}</button>
            ))}
          </div>
          <div className="res-box">
            <div className="res-row"><span>Capital</span><span>{fmtCOP(selCap)}</span></div>
            <div className="res-row"><span>Interés</span><span>+{fmtCOP(calc.interes)}</span></div>
            <div className="res-row total"><span>Total a pagar</span><span>{fmtCOP(calc.total)}</span></div>
            <div className="res-row"><span>Plazo</span><span>{calc.dias} días</span></div>
            <div className="res-row"><span>Tasa E.A.</span><span>{(calc.ea * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 })}%</span></div>
            <div className="res-row"><span>Vence</span><span>{calc.fechaVence.toLocaleDateString('es-CO')}</span></div>
          </div>
          <label className="codeu">
            <input type="checkbox" checked={conCodeudores} onChange={e => setConCodeudores(e.target.checked)} />
            <span>Aporto <strong>2 codeudores</strong> con documentos y contrato firmado — <em>mejor tasa</em></span>
          </label>
          {conCodeudores && <div className="codeu-note">📎 Deberás enviar cédula y documentos de tus 2 codeudores; un asesor los validará.</div>}
        </div>
        <div className="card">
          <div className="slbl">Datos del solicitante</div>
          <div className="perf-row"><span className="perf-k">Nombre</span><span>{user.nombre}</span></div>
          <div className="perf-row"><span className="perf-k">Cédula</span><span>{user.cedula}</span></div>
          <div className="perf-row"><span className="perf-k">Teléfono</span><span>{user.telefono || user.tel || '-'}</span></div>
          <div className="perf-row"><span className="perf-k">Nivel</span><span>N{user.nivel} · {nv.nom}</span></div>
        </div>
        <button className="btna" onClick={handleSolicitar} disabled={loading}>
          {loading ? 'Enviando...' : 'CONFIRMAR SOLICITUD ›'}
        </button>
        <div style={{ fontSize:11,color:'var(--text3)',textAlign:'center',marginTop:8 }}>Un asesor revisará y desembolsará en minutos</div>
      </div>
    </div>
  )
}
