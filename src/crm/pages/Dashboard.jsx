import { useMemo } from 'react'
import useCrmStore from '../store'
import { fmtCOP } from '../../shared/utils'
import './Dashboard.css'

export default function Dashboard() {
  const { getSolicitudes } = useCrmStore()
  const sols = getSolicitudes()

  const stats = useMemo(() => {
    const activos = sols.filter(s => s.estado === 'activo')
    const mora = sols.filter(s => s.estado === 'mora')
    const pagados = sols.filter(s => s.estado === 'pagado')
    const cartera = activos.reduce((s, x) => s + (x.totalPagar || 0), 0)
    return { total: sols.length, activos: activos.length, mora: mora.length, pagados: pagados.length, cartera }
  }, [sols])

  return (
    <div className="view active">
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">Resumen general · {new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})}</div>
      </div>
      <div className="cards-grid">
        {[
          { label:'Solicitudes totales', value:stats.total,    sub:'Todas las épocas', cls:'' },
          { label:'Créditos activos',    value:stats.activos,  sub:'En curso',         cls:'blue' },
          { label:'En mora',             value:stats.mora,     sub:'Requieren acción', cls:'red' },
          { label:'Cartera activa',      value:fmtCOP(stats.cartera), sub:'Capital + intereses', cls:'gold' },
          { label:'Pagados',             value:stats.pagados,  sub:'Completados',      cls:'green' },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="label">{c.label}</div>
            <div className={`value ${c.cls}`}>{c.value}</div>
            <div className="sub">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <div className="table-head">
          <div className="table-title">Últimas solicitudes</div>
        </div>
        {sols.length === 0 ? (
          <div style={{ padding:28, textAlign:'center', color:'var(--text3)' }}>Sin solicitudes aún</div>
        ) : (
          <table className="crm-table">
            <thead><tr><th>Nombre</th><th>Cédula</th><th>Capital</th><th>Total</th><th>Vence</th><th>Estado</th></tr></thead>
            <tbody>
              {sols.slice().reverse().slice(0,20).map(s => (
                <tr key={s.id}>
                  <td>{s.nombre}</td>
                  <td>{s.cedula}</td>
                  <td>{fmtCOP(s.capitalActivo||0)}</td>
                  <td>{fmtCOP(s.totalPagar||0)}</td>
                  <td>{s.fechaVence||'-'}</td>
                  <td><span className={`est-chip ${s.estado}`}>{s.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
