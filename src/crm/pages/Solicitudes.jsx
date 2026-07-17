import { useState, useEffect } from 'react'
import useCrmStore from '../store'
import { fmtCOP } from '../../shared/utils'
import './Dashboard.css'
import './Solicitudes.css'

export default function Solicitudes() {
  const { solicitudes, fetchSolicitudes, updateSolicitud } = useCrmStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todos')

  useEffect(() => { fetchSolicitudes() }, [])

  const filtered = solicitudes.filter(s => {
    const matchSearch = !search || s.nombre?.toLowerCase().includes(search.toLowerCase()) || s.cedula?.includes(search)
    const matchFilter = filter === 'todos' || s.estado === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="view active">
      <div className="page-header">
        <div className="page-title">Solicitudes</div>
        <div className="page-sub">{solicitudes.length} registros totales</div>
      </div>
      <div className="table-wrap">
        <div className="table-head">
          <div className="table-title">Todas las solicitudes</div>
          <div style={{ display:'flex', gap:8 }}>
            <input className="search-box" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="search-box" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="activo">Activos</option>
              <option value="mora">En mora</option>
              <option value="pagado">Pagados</option>
            </select>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding:28, textAlign:'center', color:'var(--text3)' }}>Sin resultados</div>
        ) : (
          <table className="crm-table">
            <thead><tr><th>Nombre</th><th>Cédula</th><th>Capital</th><th>Cuota</th><th>E.A.</th><th>Total</th><th>Vence</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              {filtered.map(s => {
                const nCuotas = s.plazo >= 90 ? Math.round(s.plazo / 30) : 0
                const cuota = nCuotas ? Math.round((s.totalPagar || 0) / nCuotas) : 0
                return (
                <tr key={s.id}>
                  <td>{s.nombre}{s.codeudores && <span title="Aporta 2 codeudores" style={{ marginLeft:6 }}>👥</span>}</td><td>{s.cedula}</td>
                  <td>{fmtCOP(s.capital || 0)}</td>
                  <td>{nCuotas ? `${fmtCOP(cuota)} × ${nCuotas}` : '—'}</td>
                  <td>{s.tasa ? `${Math.round(s.tasa * 1000) / 10}%` : '—'}</td>
                  <td>{fmtCOP(s.totalPagar || 0)}</td>
                  <td>{s.fechaVence || '-'}</td>
                  <td><span className={`est-chip ${s.estado}`}>{s.estado}</span></td>
                  <td>
                    <select className="act-sel" value={s.estado}
                      onChange={e => updateSolicitud(s.id, { estado: e.target.value })}>
                      <option value="pendiente">Pendiente</option>
                      <option value="activo">Activo</option>
                      <option value="mora">Mora</option>
                      <option value="pagado">Pagado</option>
                    </select>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
