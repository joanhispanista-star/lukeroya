import { useState, useMemo } from 'react'
import { TECHO_EA, MESES_OPCIONES } from '../../shared/constants'
import { fmtCOP, tasaMensual } from '../../shared/utils'
import './Calculadora.css'

// Formatea una tasa (decimal) como % legible
function fmtPct(x) {
  const p = x * 100
  if (!isFinite(p)) return '—'
  return p.toLocaleString('es-CO', { maximumFractionDigits: 2 }) + ' %'
}

// Techos de usura E.A. por régimen (cambian cada mes — reconfirmar en la SFC)
const REGIMENES = [
  { key: 'consumo',       label: 'Consumo y ordinario',     techo: TECHO_EA * 100, nota: 'Jul 2026 ≈ 28,79% E.A. Techo base para una SAS que presta con recursos propios (sincronizado con TECHO_EA del código).' },
  { key: 'microcredito',  label: 'Microcrédito productivo', techo: 87.72, nota: 'Jul 2026 (popular productivo urbano). El destino del crédito debe ser una microempresa; admite comisión MiPyme aparte.' },
  { key: 'personalizado', label: 'Personalizado',           techo: null,  nota: 'Ingresa manualmente el techo vigente que te confirme tu abogado.' },
]

export default function Calculadora() {
  const [cliente, setCliente]       = useState('')
  const [capital, setCapital]       = useState(200000)
  const [meses, setMeses]           = useState(3)
  const [eaPct, setEaPct]           = useState(26)      // Tasa E.A. % del crédito
  const [codeudores, setCodeudores] = useState(false)
  const [regimen, setRegimen]       = useState('consumo')
  const [techo, setTecho]           = useState(Math.round(TECHO_EA * 10000) / 100)

  const r = useMemo(() => {
    const cap = Number(capital) || 0
    const n   = Math.max(1, Math.round(Number(meses) || 3))
    const eaBase = (Number(eaPct) || 0) / 100
    const ea  = codeudores ? eaBase * 0.75 : eaBase

    const im    = tasaMensual(ea)
    const cuota = im > 0 ? Math.round(cap * im / (1 - Math.pow(1 + im, -n))) : Math.round(cap / n)
    const total = cuota * n
    const interes = total - cap

    const techoR = (Number(techo) || 0) / 100
    const legal  = ea > 0 && ea <= techoR

    // Interés máximo legal para este plazo (con la E.A. igual al techo)
    const imMax    = tasaMensual(techoR)
    const cuotaMax = imMax > 0 ? Math.round(cap * imMax / (1 - Math.pow(1 + imMax, -n))) : Math.round(cap / n)
    const interesMaxLegal = Math.max(0, cuotaMax * n - cap)

    return { cap, n, ea, cuota, total, interes, techoR, legal, interesMaxLegal }
  }, [capital, meses, eaPct, codeudores, techo])

  const pickRegimen = (k) => {
    setRegimen(k)
    const reg = REGIMENES.find(x => x.key === k)
    if (reg && reg.techo != null) setTecho(Math.round(reg.techo * 100) / 100)
  }
  const editTecho = (v) => { setTecho(v); setRegimen('personalizado') }
  const notaRegimen = (REGIMENES.find(x => x.key === regimen) || {}).nota

  return (
    <div className="view active">
      <div className="page-header">
        <div className="page-title">Calculadora de crédito</div>
        <div className="page-sub">Crédito a cuotas mensuales · el semáforo avisa si la tasa excede el techo de usura</div>
      </div>

      <div className="calc-disclaimer">
        ⚖️ La <b>Tasa Efectiva Anual (E.A.)</b> es lo que la ley usa para medir la usura y aplica al <b>costo total</b>.
        El techo es <b>ajustable</b> — confirma el valor vigente con la SFC y con tu abogado antes de operar.
      </div>

      <div className="calc-grid">
        {/* ── PANEL DE ENTRADAS ── */}
        <div className="calc-card">
          <div className="calc-card-title">Condiciones</div>

          <label className="calc-field">
            <span>Cliente <em>(opcional)</em></span>
            <input type="text" placeholder="Nombre o cédula del cliente" value={cliente}
              onChange={e => setCliente(e.target.value)} />
          </label>

          <label className="calc-field">
            <span>Capital prestado</span>
            <input type="number" step="50000" value={capital} onChange={e => setCapital(e.target.value)} />
          </label>

          <label className="calc-field">
            <span>Plazo (meses)</span>
            <select value={meses} onChange={e => setMeses(e.target.value)}>
              {MESES_OPCIONES.map(m => <option key={m} value={m}>{m} meses</option>)}
              <option value={9}>9 meses</option>
              <option value={12}>12 meses</option>
            </select>
          </label>

          <label className="calc-field">
            <span>Tasa E.A. del crédito (%)</span>
            <input type="number" step="0.5" value={eaPct} onChange={e => setEaPct(e.target.value)} />
          </label>

          <label className="cp-check">
            <input type="checkbox" checked={codeudores} onChange={e => setCodeudores(e.target.checked)} />
            <span>Aporta <strong>2 codeudores</strong> (garantía) — la tasa baja 25%</span>
          </label>

          <label className="calc-field" style={{ marginTop: 12 }}>
            <span>Régimen legal de referencia</span>
            <select value={regimen} onChange={e => pickRegimen(e.target.value)}>
              {REGIMENES.map(rg => <option key={rg.key} value={rg.key}>{rg.label}</option>)}
            </select>
          </label>

          <label className="calc-field calc-field-techo">
            <span>Techo de usura E.A. (%) <em>· ajustable</em></span>
            <input type="number" step="0.01" value={techo} onChange={e => editTecho(e.target.value)} />
          </label>
          {notaRegimen && <div className="calc-note">{notaRegimen}</div>}
        </div>

        {/* ── PANEL DE RESULTADOS ── */}
        <div className="calc-card">
          <div className="calc-card-title">Resultado {cliente && <span className="calc-cliente">· {cliente}</span>}</div>

          <div className="calc-hero">
            <div>
              <div className="calc-hero-label">Cuota mensual × {r.n}</div>
              <div className="calc-hero-value">{fmtCOP(r.cuota)}</div>
            </div>
            <div className={`calc-legal ${r.legal ? 'ok' : 'bad'}`}>
              {r.legal ? '✓ Dentro del techo' : '✕ Excede el techo'}
            </div>
          </div>

          <table className="calc-breakdown">
            <tbody>
              <tr><td>Capital (regresa)</td><td>{fmtCOP(r.cap)}</td></tr>
              <tr><td>Interés total</td><td>{fmtCOP(r.interes)}</td></tr>
              <tr className="calc-row-strong"><td>Total que paga el cliente</td><td>{fmtCOP(r.total)} · {r.n} cuotas</td></tr>
            </tbody>
          </table>

          <div className="calc-ea-grid">
            <div className={`calc-ea ${r.legal ? 'ok' : 'bad'}`}>
              <div className="calc-ea-label">Tasa Efectiva Anual del plan</div>
              <div className="calc-ea-value">{fmtPct(r.ea)}</div>
              <div className="calc-ea-sub">Techo fijado: {fmtPct(r.techoR)} E.A.{codeudores ? ' · Ya incluye el descuento por codeudores.' : ''}</div>
            </div>
            <div className="calc-ea muted">
              <div className="calc-ea-label">Interés máximo legal ({r.n} meses)</div>
              <div className="calc-ea-value">{fmtCOP(r.interesMaxLegal)}</div>
              <div className="calc-ea-sub">Cobrar más que esto sobre {fmtCOP(r.cap)} excede el techo — no se aprueba.</div>
            </div>
          </div>

          <div className="calc-note" style={{ marginTop: 10 }}>
            💡 El riesgo del cliente NO sube el techo: a un cliente riesgoso se le presta menos, se le piden
            codeudores, o no se le presta — nunca se cobra en rojo.
          </div>
        </div>
      </div>
    </div>
  )
}
