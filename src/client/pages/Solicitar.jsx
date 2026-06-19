import { useState } from 'react'
import useClientStore from '../store'
import { NV } from '../../shared/constants'
import { fmtCOP, capsDisp, calcCredito } from '../../shared/utils'
import { loadSolicitudes, saveSolicitudes } from '../../shared/storage'
import './Solicitar.css'

export default function Solicitar() {
  const { user, nav, showToast } = useClientStore()
  const [done, setDone] = useState(false)
  const [okMsg, setOkMsg] = useState('')
  if (!user) return null

  const nv = NV[user.nivel - 1]
  const caps = capsDisp(nv, user.puntos || 0)
  const [selCap, setSelCap] = useState(caps[0]?.m || nv.caps[0].m)
  const calc = calcCredito(selCap, user.nivel)

  function handleSolicitar() {
    const fd = new Date().toLocaleDateString('es-CO')
    const sol = {
      id: 'sol_' + Date.now(),
      nombre: user.nombre, cedula: user.cedula, tel: user.tel,
      ciudad: user.ciudad || '', nivel: user.nivel,
      capitalActivo: selCap, totalPagar: calc.total,
      estado: 'activo', fuente: 'Lukero App',
      fechaDesembolso: fd, fechaVence: calc.fechaVence.toLocaleDateString('es-CO'),
      puntos: user.puntos, creditosCompletados: user.creds || 0,
      timestamp: new Date().toISOString(),
    }
    const sols = loadSolicitudes()
    saveSolicitudes([...sols, sol])
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
            <div className="res-row"><span>Costo ({Math.round(nv.tasa*100)}%)</span><span>+{fmtCOP(calc.total-selCap)}</span></div>
            <div className="res-row total"><span>Total a pagar</span><span>{fmtCOP(calc.total)}</span></div>
            <div className="res-row"><span>Plazo</span><span>{calc.dias} días</span></div>
            <div className="res-row"><span>Vence</span><span>{calc.fechaVence.toLocaleDateString('es-CO')}</span></div>
          </div>
        </div>
        <div className="card">
          <div className="slbl">Datos del solicitante</div>
          <div className="perf-row"><span className="perf-k">Nombre</span><span>{user.nombre}</span></div>
          <div className="perf-row"><span className="perf-k">Cédula</span><span>{user.cedula}</span></div>
          <div className="perf-row"><span className="perf-k">Teléfono</span><span>{user.tel}</span></div>
          <div className="perf-row"><span className="perf-k">Nivel</span><span>N{user.nivel} · {nv.nom}</span></div>
        </div>
        <button className="btna" onClick={handleSolicitar}>CONFIRMAR SOLICITUD ›</button>
        <div style={{ fontSize:11,color:'var(--text3)',textAlign:'center',marginTop:8 }}>Un asesor revisará y desembolsará en minutos</div>
      </div>
    </div>
  )
}
