import { useState } from 'react'
import { loadUsers } from '../../shared/storage'
import { NV } from '../../shared/constants'
import { fmtCOP } from '../../shared/utils'
import './Dashboard.css'
import './Solicitudes.css'

export default function Clientes() {
  const [search, setSearch] = useState('')
  const users = loadUsers().filter(u =>
    !search || u.nombre?.toLowerCase().includes(search.toLowerCase()) || u.cedula?.includes(search)
  )

  return (
    <div className="view active">
      <div className="page-header">
        <div className="page-title">Clientes</div>
        <div className="page-sub">{users.length} usuarios registrados</div>
      </div>
      <div className="table-wrap">
        <div className="table-head">
          <div className="table-title">Base de clientes</div>
          <input className="search-box" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {users.length === 0 ? (
          <div style={{ padding:28, textAlign:'center', color:'var(--text3)' }}>Sin clientes registrados</div>
        ) : (
          <table className="crm-table">
            <thead><tr><th>Nombre</th><th>Cédula</th><th>Tel</th><th>Ciudad</th><th>Nivel</th><th>Puntos</th><th>Créditos</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.cedula}>
                  <td>{u.nombre}</td><td>{u.cedula}</td><td>{u.tel}</td><td>{u.ciudad||'-'}</td>
                  <td><span className="est-chip activo">N{u.nivel} · {NV[(u.nivel||1)-1]?.nom}</span></td>
                  <td>{u.puntos||0}</td><td>{u.creds||0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
