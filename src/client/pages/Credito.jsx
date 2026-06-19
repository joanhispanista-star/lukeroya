import useClientStore from '../store'
import { fmtCOP } from '../../shared/utils'
import './Credito.css'

export default function Credito() {
  const { user, nav } = useClientStore()
  const cr = user?.creditoActivo

  if (!cr || cr.estado === 'pagado') {
    return (
      <div className="screen-inner">
        <nav className="topnav"><div className="nav-logo">Mi Crédito</div></nav>
        <div className="pw">
          <div className="no-cred">
            <div style={{ fontSize:48, marginBottom:12 }}>💳</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:18 }}>Sin crédito activo</div>
            <div style={{ color:'var(--text2)', fontSize:13, margin:'8px 0 18px' }}>Solicita tu primer crédito y recíbelo en minutos.</div>
            <button className="btna" onClick={() => nav('sol')}>SOLICITAR AHORA ›</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-inner">
      <nav className="topnav"><div className="nav-logo">Mi Crédito</div></nav>
      <div className="pw">
        <div className="cred-card">
          <div className="cred-lbl">Capital</div>
          <div className="cred-val">{fmtCOP(cr.capital || 0)}</div>
          <div className="cred-lbl" style={{ marginTop:10 }}>Total a pagar</div>
          <div className="cred-val total">{fmtCOP(cr.totalPagar || 0)}</div>
          <div className="cred-row">
            <div><div className="cred-lbl">Vence</div><div className="cred-date">{cr.fechaVence || '-'}</div></div>
            <div className={`est-badge ${cr.estado}`}>{cr.estado}</div>
          </div>
        </div>
        <div className="cred-info">
          <div className="ctitle">💡 Descuentos por pago anticipado</div>
          {[
            ['3+ días antes','Póliza + interés GRATIS','var(--green)'],
            ['2 días antes','Póliza gratis','var(--blue)'],
            ['1 día antes','50% desc. gastos tech','var(--gold)'],
            ['Día de pago (antes 12pm)','40% desc. gastos tech','var(--orange)'],
          ].map(([d,d2,c]) => (
            <div key={d} className="desc-row">
              <span style={{ color:c, fontWeight:700, fontSize:12 }}>{d}</span>
              <span style={{ fontSize:12, color:'var(--text2)' }}>{d2}</span>
            </div>
          ))}
        </div>
        <button className="btna" onClick={() => nav('luka')}>🤖 Consultar a Luka</button>
      </div>
    </div>
  )
}
