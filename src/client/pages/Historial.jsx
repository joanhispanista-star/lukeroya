import { useEffect } from 'react'
import useClientStore from '../store'
import { fmtCOP } from '../../shared/utils'
import './Historial.css'

export default function Historial() {
  const { misSolicitudes, fetchMisSolicitudes } = useClientStore()

  useEffect(() => { fetchMisSolicitudes() }, [])

  const sols = [...misSolicitudes].sort((a, b) => new Date(b.fechaSol || 0) - new Date(a.fechaSol || 0))

  return (
    <div className="screen-inner">
      <nav className="topnav"><div className="nav-logo">Historial</div></nav>
      <div className="pw">
        <div className="seh"><h2>Tus créditos</h2></div>
        {sols.length === 0 ? (
          <div className="est">Aún no tienes créditos registrados 📋</div>
        ) : (
          sols.map((s) => (
            <div key={s.id} className="card hist-card">
              <div className="hist-row">
                <div>
                  <div className="hist-cap">{fmtCOP(s.capital || s.monto || 0)}</div>
                  <div className="hist-fecha">{s.fechaSol ? new Date(s.fechaSol).toLocaleDateString('es-CO') : ''}</div>
                </div>
                <div className={`hist-estado ${s.estado}`}>{s.estado === 'pendiente' ? 'en revisión' : s.estado}</div>
              </div>
              <div className="hist-total">Total: {fmtCOP(s.totalPagar || 0)} · Vence {s.fechaVence || '-'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
