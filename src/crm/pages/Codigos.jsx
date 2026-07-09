import { useEffect, useState } from 'react'
import useCrmStore from '../store'
import './Dashboard.css'
import './Solicitudes.css'
import './Codigos.css'

export default function Codigos() {
  const { codigos, fetchCodigos, generarCodigo, revocarCodigo, user } = useCrmStore()
  const [nota, setNota] = useState('')
  const [cedula, setCedula] = useState('')
  const [nuevo, setNuevo] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [copiado, setCopiado] = useState('')

  useEffect(() => { fetchCodigos() }, [])

  async function generar() {
    setErr(''); setBusy(true)
    const d = await generarCodigo({ nota: nota.trim(), cedula: cedula.trim(), creadoPor: user?.name || user?.rol || '' })
    setBusy(false)
    if (d.error) { setErr(d.error); return }
    setNuevo(d.codigo); setNota(''); setCedula('')
  }

  function copiar(c) {
    try { navigator.clipboard?.writeText(c) } catch {}
    setCopiado(c); setTimeout(() => setCopiado(''), 1500)
  }

  async function borrar(c) {
    if (!window.confirm(`¿Borrar el código ${c}? (solo si aún no se ha usado)`)) return
    const e = await revocarCodigo(c)
    if (e) setErr(e)
  }

  const sinUsar = codigos.filter(c => !c.usado).length

  return (
    <div className="view active">
      <div className="page-header">
        <div className="page-title">Códigos de acceso</div>
        <div className="page-sub">{codigos.length} códigos · {sinUsar} sin usar · entrégale uno a cada cliente para que se pueda registrar</div>
      </div>

      <div className="cod-gen">
        <div className="cod-gen-title">Generar un código nuevo</div>
        <div className="cod-gen-row">
          <label className="cod-field">
            <span>Para quién (nombre / nota)</span>
            <input value={nota} onChange={e => setNota(e.target.value)} placeholder="Ej. Carlos Pérez" />
          </label>
          <label className="cod-field">
            <span>Cédula (opcional — bloquea el código a esa cédula)</span>
            <input value={cedula} onChange={e => setCedula(e.target.value)} placeholder="Opcional" />
          </label>
          <button className="cod-btn" disabled={busy} onClick={generar}>{busy ? 'Generando…' : '+ Generar código'}</button>
        </div>
        {err && <div className="cod-err">{err}</div>}
        {nuevo && (
          <div className="cod-nuevo">
            <div>
              <div className="cod-nuevo-lbl">Nuevo código — entrégaselo al cliente:</div>
              <div className="cod-nuevo-val">{nuevo}</div>
            </div>
            <button className="cod-btn-ghost" onClick={() => copiar(nuevo)}>{copiado === nuevo ? '¡Copiado!' : 'Copiar'}</button>
          </div>
        )}
      </div>

      <div className="table-wrap">
        <div className="table-head"><div className="table-title">Códigos emitidos</div></div>
        {codigos.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--text3)' }}>Aún no has generado códigos</div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr><th>Código</th><th>Para quién</th><th>Cédula</th><th>Estado</th><th>Usado por</th><th></th></tr>
            </thead>
            <tbody>
              {codigos.map(c => (
                <tr key={c.codigo}>
                  <td className="cod-code">{c.codigo}</td>
                  <td>{c.nota || '-'}</td>
                  <td>{c.cedulaAsignada || <span style={{ color: 'var(--text3)' }}>cualquiera</span>}</td>
                  <td>{c.usado
                    ? <span className="est-chip pagado">Usado</span>
                    : <span className="est-chip pendiente">Sin usar</span>}</td>
                  <td>{c.usadoPor || '-'}</td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                    {!c.usado && (
                      <>
                        <button className="cod-mini" onClick={() => copiar(c.codigo)}>{copiado === c.codigo ? '✓' : 'Copiar'}</button>
                        <button className="cod-mini cod-mini-del" onClick={() => borrar(c.codigo)}>Borrar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
