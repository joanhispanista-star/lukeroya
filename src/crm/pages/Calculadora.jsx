import { useState, useMemo } from 'react'
import { NV } from '../../shared/constants'
import { fmtCOP } from '../../shared/utils'
import './Calculadora.css'

const IVA = 1.19

// Tasa Efectiva Anual a partir de un costo (ratio sobre capital) y un plazo en días
function toEA(costoRatio, dias) {
  if (costoRatio <= 0 || dias <= 0) return 0
  return Math.pow(1 + costoRatio, 365 / dias) - 1
}

// Formatea una tasa (decimal) como % legible, incluso cuando es gigante
function fmtPct(x) {
  const p = x * 100
  if (!isFinite(p)) return '—'
  if (p >= 1e6) return (p / 1e6).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + ' millones %'
  if (p >= 1000) return Math.round(p).toLocaleString('es-CO') + ' %'
  return p.toLocaleString('es-CO', { maximumFractionDigits: 2 }) + ' %'
}

// Techos de usura E.A. por régimen (verificados; cambian cada mes — reconfirmar en la SFC)
const REGIMENES = [
  { key: 'consumo',       label: 'Consumo y ordinario',     techo: 24.36, nota: 'Ene 2026 (subió a ~28,8% en jul 2026). Es el techo base para una SAS que presta con recursos propios.' },
  { key: 'bajomonto',     label: 'Consumo de bajo monto',   techo: 68.85, nota: 'Ene 2026. REQUIERE vigilancia de la SFC — NO aplica a una SAS con recursos propios.' },
  { key: 'microcredito',  label: 'Microcrédito productivo', techo: 87.72, nota: 'Jul 2026 (popular productivo urbano). El destino del crédito debe ser una microempresa; admite comisión MiPyme aparte.' },
  { key: 'personalizado', label: 'Personalizado',           techo: null,  nota: 'Ingresa manualmente el techo vigente que te confirme tu abogado.' },
]

export default function Calculadora() {
  const [cliente, setCliente]   = useState('')
  const [capital, setCapital]   = useState(200000)
  const [dias, setDias]         = useState(8)
  const [modo, setModo]         = useState('estandar')  // 'estandar' | 'excepcion'
  const [tasaStd, setTasaStd]   = useState(30)          // % del capital (modo estándar)
  const [regimen, setRegimen]   = useState('consumo')   // régimen legal de referencia
  const [techo, setTecho]       = useState(24.36)       // techo de usura E.A. % (AJUSTABLE)

  // Componentes en modo excepción, como % del capital
  const [cInteres, setCInteres] = useState(12)
  const [cPoliza, setCPoliza]   = useState(6)
  const [cTech, setCTech]       = useState(8.9)         // ya incluye IVA
  const [cAdmin, setCAdmin]     = useState(4.5)

  const r = useMemo(() => {
    const cap = Number(capital) || 0
    const d   = Number(dias) || 1
    let interes, poliza, tech, admin

    if (modo === 'estandar') {
      const t = (Number(tasaStd) || 0) / 100
      interes = Math.round(cap * t * 0.40)
      poliza  = Math.round(cap * t * 0.20)
      tech    = Math.round(cap * t * 0.25 * IVA)
      admin   = Math.round(cap * t * 0.15)
    } else {
      interes = Math.round(cap * (Number(cInteres) || 0) / 100)
      poliza  = Math.round(cap * (Number(cPoliza)  || 0) / 100)
      tech    = Math.round(cap * (Number(cTech)    || 0) / 100)
      admin   = Math.round(cap * (Number(cAdmin)   || 0) / 100)
    }

    const cobro        = interes + poliza + tech + admin
    const total        = cap + cobro
    const costoRatio   = cap ? cobro / cap : 0
    const ivaIncluido  = Math.round(tech - tech / IVA)
    const gananciaBruta = cobro - ivaIncluido

    const eaTotal   = toEA(costoRatio, d)
    const eaInteres = toEA(cap ? interes / cap : 0, d)

    const techoR = (Number(techo) || 0) / 100
    const legal  = eaTotal <= techoR && costoRatio > 0
    const cobroMaxLegal = Math.round(cap * (Math.pow(1 + techoR, d / 365) - 1))
    const diasMinLegal  = (costoRatio > 0 && techoR > 0)
      ? Math.ceil(365 * Math.log(1 + costoRatio) / Math.log(1 + techoR))
      : 0

    return { cap, d, interes, poliza, tech, admin, cobro, total, costoRatio,
             ivaIncluido, gananciaBruta, eaTotal, eaInteres, techoR, legal,
             cobroMaxLegal, diasMinLegal }
  }, [capital, dias, modo, tasaStd, techo, cInteres, cPoliza, cTech, cAdmin])

  const pickRegimen = (k) => {
    setRegimen(k)
    const reg = REGIMENES.find(x => x.key === k)
    if (reg && reg.techo != null) setTecho(reg.techo)
  }
  const editTecho = (v) => { setTecho(v); setRegimen('personalizado') }
  const notaRegimen = (REGIMENES.find(x => x.key === regimen) || {}).nota

  return (
    <div className="view active">
      <div className="page-header">
        <div className="page-title">Calculadora de crédito</div>
        <div className="page-sub">Simula condiciones, crea excepciones por cliente y verifica el costo real (E.A.)</div>
      </div>

      <div className="calc-disclaimer">
        ⚖️ Herramienta educativa de NEXECO SAS. La <b>Tasa Efectiva Anual (E.A.)</b> es lo que la ley usa para medir la usura.
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
            <input type="number" value={capital} onChange={e => setCapital(e.target.value)} />
          </label>

          <label className="calc-field">
            <span>Plazo (días)</span>
            <input type="number" value={dias} onChange={e => setDias(e.target.value)} />
          </label>

          <div className="calc-field">
            <span>Modo de tarifa</span>
            <div className="calc-toggle">
              <button className={modo === 'estandar' ? 'on' : ''} onClick={() => setModo('estandar')}>
                Estándar (todos igual)
              </button>
              <button className={modo === 'excepcion' ? 'on' : ''} onClick={() => setModo('excepcion')}>
                Excepción (este cliente)
              </button>
            </div>
          </div>

          {modo === 'estandar' ? (
            <>
              <label className="calc-field">
                <span>Tarifa estándar (% del capital)</span>
                <input type="number" step="0.5" value={tasaStd} onChange={e => setTasaStd(e.target.value)} />
              </label>
              <div className="calc-note">Se reparte igual que tu fórmula actual: 40% interés · 20% póliza · 25% tecnología (+IVA) · 15% admin.</div>
            </>
          ) : (
            <>
              <label className="calc-field">
                <span>Interés (% del capital)</span>
                <input type="number" step="0.5" value={cInteres} onChange={e => setCInteres(e.target.value)} />
              </label>
              <label className="calc-field">
                <span>Póliza (% del capital)</span>
                <input type="number" step="0.5" value={cPoliza} onChange={e => setCPoliza(e.target.value)} />
              </label>
              <label className="calc-field">
                <span>Tecnología, IVA incluido (% del capital)</span>
                <input type="number" step="0.5" value={cTech} onChange={e => setCTech(e.target.value)} />
              </label>
              <label className="calc-field">
                <span>Admin (% del capital)</span>
                <input type="number" step="0.5" value={cAdmin} onChange={e => setCAdmin(e.target.value)} />
              </label>
            </>
          )}

          <label className="calc-field">
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
              <div className="calc-hero-label">El cliente paga en {r.d} días</div>
              <div className="calc-hero-value">{fmtCOP(r.total)}</div>
            </div>
            <div className={`calc-legal ${r.legal ? 'ok' : 'bad'}`}>
              {r.legal ? '✓ Dentro del techo' : '✕ Excede el techo'}
            </div>
          </div>

          <table className="calc-breakdown">
            <tbody>
              <tr><td>Capital (regresa)</td><td>{fmtCOP(r.cap)}</td></tr>
              <tr><td>Interés</td><td>{fmtCOP(r.interes)}</td></tr>
              <tr><td>Póliza</td><td>{fmtCOP(r.poliza)}</td></tr>
              <tr><td>Tecnología (+IVA)</td><td>{fmtCOP(r.tech)}</td></tr>
              <tr><td>Admin</td><td>{fmtCOP(r.admin)}</td></tr>
              <tr className="calc-row-strong"><td>Cobro total</td><td>{fmtCOP(r.cobro)} · {fmtPct(r.costoRatio)} del capital</td></tr>
            </tbody>
          </table>

          <div className="calc-ea-grid">
            <div className={`calc-ea ${r.legal ? 'ok' : 'bad'}`}>
              <div className="calc-ea-label">Tasa Efectiva Anual (costo total)</div>
              <div className="calc-ea-value">{fmtPct(r.eaTotal)}</div>
              <div className="calc-ea-sub">Techo fijado: {fmtPct(r.techoR)} E.A.</div>
            </div>
            <div className="calc-ea muted">
              <div className="calc-ea-label">E.A. solo del interés</div>
              <div className="calc-ea-value">{fmtPct(r.eaInteres)}</div>
              <div className="calc-ea-sub">Aunque la etiqueta “interés” sea baja, la ley mira el costo total.</div>
            </div>
          </div>

          <div className="calc-guides">
            <div className="calc-guide">
              <span className="calc-guide-k">Cobro máximo legal para {r.d} días</span>
              <span className="calc-guide-v">{fmtCOP(r.cobroMaxLegal)}</span>
            </div>
            <div className="calc-guide">
              <span className="calc-guide-k">Plazo mínimo para que este cobro sea legal</span>
              <span className="calc-guide-v">≈ {r.diasMinLegal.toLocaleString('es-CO')} días</span>
            </div>
            <div className="calc-guide">
              <span className="calc-guide-k">Ingreso bruto estimado (sin el IVA de {fmtCOP(r.ivaIncluido)})</span>
              <span className="calc-guide-v">{fmtCOP(r.gananciaBruta)}</span>
            </div>
          </div>

          <div className="calc-formula">E.A. = (1 + cobro / capital) <sup>365 / días</sup> − 1</div>
        </div>
      </div>
    </div>
  )
}
