import { useEffect } from 'react'
import useClientStore from '../store'
import { fmtCOP, copyText } from '../../shared/utils'
import './Credito.css'

// "Mi Crédito" se deriva de las solicitudes REALES del cliente (API), no de
// user.creditoActivo (que nadie escribía): así el cliente ve su crédito apenas
// el asesor lo aprueba en el CRM.
export default function Credito() {
  const { user, nav, misSolicitudes, fetchMisSolicitudes } = useClientStore()

  useEffect(() => { fetchMisSolicitudes() }, [])

  // La solicitud "viva" más reciente (pendiente, activa o en mora).
  const viva = [...misSolicitudes]
    .filter(s => ['pendiente', 'activo', 'mora'].includes(s.estado))
    .sort((a, b) => new Date(b.fechaSol || 0) - new Date(a.fechaSol || 0))[0]

  if (!viva) {
    return (
      <div className="screen-inner">
        <nav className="topnav"><div className="nav-logo">Mi Crédito</div></nav>
        <div className="pw">
          <div className="no-cred">
            <div style={{ fontSize:48, marginBottom:12 }}>💳</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:18 }}>Sin crédito activo</div>
            <div style={{ color:'var(--text2)', fontSize:13, margin:'8px 0 18px' }}>Solicita tu crédito y un asesor lo revisará.</div>
            <button className="btna" onClick={() => nav('sol')}>SOLICITAR AHORA ›</button>
          </div>
        </div>
      </div>
    )
  }

  const nCuotas = viva.plazo >= 90 ? Math.round(viva.plazo / 30) : 0
  const cuota = nCuotas ? Math.round((viva.totalPagar || 0) / nCuotas) : 0

  return (
    <div className="screen-inner">
      <nav className="topnav"><div className="nav-logo">Mi Crédito</div></nav>
      <div className="pw">
        {viva.estado === 'pendiente' && (
          <div className="cred-info" style={{ borderColor:'var(--gold)' }}>
            <div className="ctitle">⏳ En revisión</div>
            <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>
              Un asesor está revisando tu solicitud. Te contactará por WhatsApp para validar tu identidad y coordinar el desembolso.
            </div>
          </div>
        )}

        <div className="cred-card">
          <div className="cred-lbl">Capital</div>
          <div className="cred-val">{fmtCOP(viva.capital || viva.monto || 0)}</div>
          {nCuotas > 0 && (
            <>
              <div className="cred-lbl" style={{ marginTop:10 }}>Cuota mensual</div>
              <div className="cred-val total">{fmtCOP(cuota)} <span style={{ fontSize:13, color:'var(--text2)', fontWeight:400 }}>× {nCuotas} cuotas</span></div>
            </>
          )}
          <div className="cred-lbl" style={{ marginTop:10 }}>Total a pagar</div>
          <div className="cred-val total">{fmtCOP(viva.totalPagar || 0)}</div>
          <div className="cred-row">
            <div><div className="cred-lbl">Última cuota</div><div className="cred-date">{viva.fechaVence || '-'}</div></div>
            <div className={`est-badge ${viva.estado}`}>{viva.estado === 'pendiente' ? 'en revisión' : viva.estado}</div>
          </div>
        </div>

        {viva.estado !== 'pendiente' && (
          <div className="cred-info">
            <div className="ctitle">💳 ¿Dónde pago mi cuota?</div>
            <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7 }}>
              Transfiere a la llave <strong style={{ color:'var(--gold)' }}>Bre-B</strong> oficial de Lukero
              (titular <strong>Joan Sebastián Ruiz Flórez</strong>):
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
              <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, letterSpacing:1, color:'var(--gold)' }}>@bbjrf274</span>
              <button className="cpbtn" onClick={() => copyText('@bbjrf274').then(() => alert('Copiado ✓'))}>Copiar</button>
            </div>
            <div style={{ fontSize:11.5, color:'var(--text3)', marginTop:8 }}>
              Después de transferir, avísanos por WhatsApp para registrar tu pago.
            </div>
          </div>
        )}

        <div className="cred-info">
          <div className="ctitle">💡 Paga anticipado y ahorra</div>
          <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>
            Puedes pagar tu crédito en cualquier momento <strong>sin penalidad</strong>: el interés se
            recalcula por el tiempo que realmente usaste — a menos días, menos interés. Y pagar puntual
            te sube de nivel: más monto y mejor tasa en tu próximo crédito. 📈
          </div>
        </div>

        <button className="btna" onClick={() => nav('luka')}>🤖 Consultar a Luka</button>
      </div>
    </div>
  )
}
