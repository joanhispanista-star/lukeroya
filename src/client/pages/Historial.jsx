import useClientStore from '../store'
import { fmtCOP } from '../../shared/utils'
import { loadSolicitudes } from '../../shared/storage'
import './Historial.css'

export default function Historial() {
  const { user } = useClientStore()
  const sols = loadSolicitudes().filter(s => s.cedula === user?.cedula)

  return (
    <div className="screen-inner">
      <nav className="topnav"><div className="nav-logo">Historial</div></nav>
      <div className="pw">
        <div className="seh"><h2>Tus créditos anteriores</h2></div>
        {sols.length === 0 ? (
          <div className="est">Aún no tienes créditos registrados 📋</div>
        ) : (
          sols.slice().reverse().map((s, i) => (
            <div key={i} className="card hist-card">
              <div className="hist-row">
                <div><div className="hist-cap">{fmtCOP(s.capitalActivo || s.capital || 0)}</div><div className="hist-fecha">{s.fechaDesembolso || ''}</div></div>
                <div className={`hist-estado ${s.estado}`}>{s.estado}</div>
              </div>
              <div className="hist-total">Total: {fmtCOP(s.totalPagar || 0)} · Vence {s.fechaVence || '-'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
