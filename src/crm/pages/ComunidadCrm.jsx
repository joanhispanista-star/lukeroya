import { useEffect } from 'react'
import useCrmStore from '../store'
import './Dashboard.css'
import './Solicitudes.css'

export default function ComunidadCrm() {
  const { comentarios, fetchComentarios } = useCrmStore()
  useEffect(() => { fetchComentarios() }, [])

  return (
    <div className="view active">
      <div className="page-header">
        <div className="page-title">Comunidad</div>
        <div className="page-sub">{comentarios.length} opiniones · data para validar y conocer a tus clientes</div>
      </div>
      <div className="table-wrap">
        <div className="table-head">
          <div className="table-title">Opiniones y testimonios</div>
        </div>
        {comentarios.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--text3)' }}>Sin comentarios aún</div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr><th>Cliente</th><th>Cédula</th><th>Estrellas</th><th>Comentario</th><th>Red social</th><th>Tipo</th></tr>
            </thead>
            <tbody>
              {comentarios.map(c => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>{c.cedula || '-'}</td>
                  <td style={{ color: 'var(--gold)', whiteSpace: 'nowrap' }}>{'★'.repeat(c.estrellas || 5)}</td>
                  <td style={{ maxWidth: 340 }}>{c.texto}</td>
                  <td style={{ color: 'var(--blue)' }}>{c.redSocial || '-'}</td>
                  <td>{c.destacado
                    ? <span className="est-chip pagado">Verificado</span>
                    : <span className="est-chip pendiente">Usuario</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
