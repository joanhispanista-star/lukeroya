import { useState, useMemo } from 'react'
import { fmtCOP } from '../../shared/utils'
import './Calculadora.css'
import './Contrapropuesta.css'

const REGIMENES = [
  { key: 'consumo',       label: 'Consumo y ordinario',     techo: 24.36, nota: 'Ene 2026 (subió a ~28,8% jul 2026). Base para una SAS con recursos propios.' },
  { key: 'bajomonto',     label: 'Consumo de bajo monto',   techo: 68.85, nota: 'Requiere vigilancia SFC — NO aplica a una SAS con recursos propios.' },
  { key: 'microcredito',  label: 'Microcrédito productivo', techo: 87.72, nota: 'Jul 2026. Destino microempresa; admite comisión MiPyme aparte.' },
  { key: 'personalizado', label: 'Personalizado',           techo: null,  nota: 'Techo manual que confirme tu abogado.' },
]

function fmtPct(x) {
  const p = x * 100
  if (!isFinite(p)) return '—'
  if (p >= 1e6) return (p / 1e6).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + ' millones %'
  if (p >= 1000) return Math.round(p).toLocaleString('es-CO') + ' %'
  return p.toLocaleString('es-CO', { maximumFractionDigits: 2 }) + ' %'
}

export default function Contrapropuesta() {
  const [nombre, setNombre]         = useState('')
  const [cedula, setCedula]         = useState('')
  const [montoSolic, setMontoSolic] = useState(200000)
  const [montoAprob, setMontoAprob] = useState(200000)
  const [dias, setDias]             = useState(8)
  const [regimen, setRegimen]       = useState('consumo')
  const [techo, setTecho]           = useState(24.36)
  const [interesEA, setInteresEA]   = useState(24)      // FIJO, en % E.A. (anual) — la unidad legal
  const [tech, setTech]             = useState(5000)    // COP fijo, independiente del monto
  const [admin, setAdmin]           = useState(3000)    // COP fijo, independiente del monto
  const [seguro, setSeguro]         = useState(0)       // COP, seleccionable por el asesor
  const [seguroReal, setSeguroReal] = useState(true)    // ¿póliza real de aseguradora?
  const [soporte, setSoporte]       = useState(0)       // puntos de "soporte de riesgo" del cliente
  const [codeudores, setCodeudores] = useState(false)   // ¿aportó 2 codeudores con documentos?
  const [ced1, setCed1]             = useState('')
  const [ced2, setCed2]             = useState('')

  const r = useMemo(() => {
    const cap = Number(montoAprob) || 0
    const d   = Number(dias) || 1
    const ea  = (Number(interesEA) || 0) / 100
    // El interés se cobra por el plazo real, partiendo de una tasa Efectiva Anual (legal)
    const interes = Math.round(cap * (Math.pow(1 + ea, d / 365) - 1))
    const t = Math.round(Number(tech) || 0)
    const a = Math.round(Number(admin) || 0)
    const s = Math.round(Number(seguro) || 0)
    // Un seguro REAL (prima que va a la aseguradora) queda FUERA del techo. Si es margen, cuenta.
    const seguroCuenta = seguroReal ? 0 : s
    const cobroCuenta  = interes + t + a + seguroCuenta   // lo que la ley suma para usura
    const totalPagar   = cap + interes + t + a + s        // lo que paga el cliente
    const ratio    = cap ? cobroCuenta / cap : 0
    const eaTotal  = ratio > 0 ? Math.pow(1 + ratio, 365 / d) - 1 : 0
    const techoR   = (Number(techo) || 0) / 100
    const legal    = eaTotal <= techoR
    const cobroMaxLegal = Math.round(cap * (Math.pow(1 + techoR, d / 365) - 1))
    const fv = new Date()
    fv.setDate(fv.getDate() + d)
    const fechaVence = fv.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    return { cap, d, interes, t, a, s, seguroReal, cobroCuenta, totalPagar, ratio, eaTotal, techoR, legal, cobroMaxLegal, fechaVence }
  }, [montoAprob, dias, interesEA, tech, admin, seguro, seguroReal, techo])

  const pickRegimen = (k) => {
    setRegimen(k)
    const reg = REGIMENES.find(x => x.key === k)
    if (reg && reg.techo != null) setTecho(reg.techo)
  }
  const editTecho = (v) => { setTecho(v); setRegimen('personalizado') }
  const notaRegimen = (REGIMENES.find(x => x.key === regimen) || {}).nota
  const aplicarCodeudores = (on) => {
    setCodeudores(on)
    if (on) { setAdmin(0); setSeguro(0) }   // 2 codeudores + contrato → exonera admin y seguro
  }

  return (
    <div className="view active">
      <div className="page-header">
        <div className="page-title">Generar contrapropuesta</div>
        <div className="page-sub">El asesor fija las condiciones ante una solicitud; el cliente confirma</div>
      </div>

      <div className="calc-disclaimer">
        ⚖️ El <b>interés se fija en % anual (E.A.)</b> — la unidad que mide la ley. El semáforo suma <b>interés + tecnología + admin + seguro-margen</b> y avisa si el total pasa el techo de usura. Solo un <b>seguro real</b> (prima que va a la aseguradora) queda fuera del techo.
      </div>

      <div className="calc-grid">
        {/* ── SOLICITUD Y CONDICIONES ── */}
        <div className="calc-card">
          <div className="calc-card-title">Solicitud y condiciones</div>

          <div className="cp-row2">
            <label className="calc-field"><span>Cliente</span>
              <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} /></label>
            <label className="calc-field"><span>Cédula</span>
              <input type="text" placeholder="C.C." value={cedula} onChange={e => setCedula(e.target.value)} /></label>
          </div>

          <div className="cp-row2">
            <label className="calc-field"><span>Monto solicitado</span>
              <input type="number" value={montoSolic} onChange={e => setMontoSolic(e.target.value)} /></label>
            <label className="calc-field"><span>Monto aprobado</span>
              <input type="number" value={montoAprob} onChange={e => setMontoAprob(e.target.value)} /></label>
          </div>

          <div className="cp-row2">
            <label className="calc-field"><span>Plazo (días)</span>
              <input type="number" value={dias} onChange={e => setDias(e.target.value)} /></label>
            <label className="calc-field"><span>Soporte de riesgo (pts)</span>
              <input type="number" value={soporte} onChange={e => setSoporte(e.target.value)} /></label>
          </div>
          {Number(soporte) > 0 && <div className="calc-note">Este cliente ya ganó {Number(soporte).toLocaleString('es-CO')} pts de soporte de riesgo → puedes aprobarle un monto mayor o mejor tasa.</div>}

          <label className="calc-field">
            <span>Régimen legal de referencia</span>
            <select value={regimen} onChange={e => pickRegimen(e.target.value)}>
              {REGIMENES.map(rg => <option key={rg.key} value={rg.key}>{rg.label}</option>)}
            </select>
          </label>
          {notaRegimen && <div className="calc-note">{notaRegimen}</div>}

          <label className="calc-field calc-field-techo">
            <span>Techo de usura E.A. (%) <em>· ajustable</em></span>
            <input type="number" step="0.01" value={techo} onChange={e => editTecho(e.target.value)} />
          </label>

          <div className="cp-sep">Valores del servicio</div>

          <label className="calc-field">
            <span>Interés FIJO (% anual · E.A.)</span>
            <input type="number" step="0.5" value={interesEA} onChange={e => setInteresEA(e.target.value)} />
          </label>
          <div className="cp-row2">
            <label className="calc-field"><span>Tecnología (COP, fijo)</span>
              <input type="number" step="500" value={tech} onChange={e => setTech(e.target.value)} /></label>
            <label className="calc-field"><span>Admin (COP, fijo)</span>
              <input type="number" step="500" value={admin} onChange={e => setAdmin(e.target.value)} /></label>
          </div>
          <label className="calc-field">
            <span>Seguro (COP, seleccionable)</span>
            <input type="number" step="500" value={seguro} onChange={e => setSeguro(e.target.value)} />
          </label>
          <label className="cp-check">
            <input type="checkbox" checked={seguroReal} onChange={e => setSeguroReal(e.target.checked)} />
            Es una póliza real de aseguradora (la prima va a la aseguradora, no a Lukero) → va aparte del techo
          </label>

          <div className="cp-sep">Codeudores (garantía)</div>
          <label className="cp-check">
            <input type="checkbox" checked={codeudores} onChange={e => aplicarCodeudores(e.target.checked)} />
            El cliente aportó <b>2 codeudores</b> con documentos y contrato firmado → exonera administración y seguro
          </label>
          {codeudores && (
            <div className="cp-row2" style={{ marginTop: 12 }}>
              <label className="calc-field"><span>Cédula codeudor 1</span>
                <input type="text" value={ced1} onChange={e => setCed1(e.target.value)} /></label>
              <label className="calc-field"><span>Cédula codeudor 2</span>
                <input type="text" value={ced2} onChange={e => setCed2(e.target.value)} /></label>
            </div>
          )}
        </div>

        {/* ── CONTRAPROPUESTA ── */}
        <div className="calc-card">
          <div className="calc-card-title">
            Contrapropuesta {nombre && <span className="calc-cliente">· {nombre}</span>}
          </div>

          <div className="calc-hero">
            <div>
              <div className="calc-hero-label">Total a pagar · vence {r.fechaVence}</div>
              <div className="calc-hero-value">{fmtCOP(r.totalPagar)}</div>
            </div>
            <div className={`calc-legal ${r.legal ? 'ok' : 'bad'}`}>
              {r.legal ? '✓ Dentro del techo' : '✕ Excede el techo'}
            </div>
          </div>

          <table className="calc-breakdown">
            <tbody>
              <tr><td>Monto aprobado</td><td>{fmtCOP(r.cap)}</td></tr>
              <tr><td>Interés ({fmtPct((Number(interesEA) || 0) / 100)} E.A.)</td><td>{fmtCOP(r.interes)}</td></tr>
              <tr><td>Tecnología (fijo)</td><td>{fmtCOP(r.t)}</td></tr>
              <tr><td>Admin (fijo)</td><td>{fmtCOP(r.a)}</td></tr>
              <tr><td>Seguro {r.seguroReal ? '(real · aparte)' : '(margen · cuenta)'}</td><td>{fmtCOP(r.s)}</td></tr>
              <tr className="calc-row-strong"><td>Total a pagar</td><td>{fmtCOP(r.totalPagar)}</td></tr>
            </tbody>
          </table>

          <div className={`calc-ea ${r.legal ? 'ok' : 'bad'}`} style={{ marginBottom: 16 }}>
            <div className="calc-ea-label">Costo total en Tasa Efectiva Anual (lo que mide la ley)</div>
            <div className="calc-ea-value">{fmtPct(r.eaTotal)}</div>
            <div className="calc-ea-sub">Techo: {fmtPct(r.techoR)} E.A. · Cobro máx. legal para {r.d} días: {fmtCOP(r.cobroMaxLegal)}</div>
          </div>

          {!r.legal && (
            <div className="cp-warn">⚠️ Esta contrapropuesta supera el techo de usura. Baja el interés, los fijos o alarga el plazo hasta que el semáforo quede verde antes de enviarla.</div>
          )}

          <div className="cp-status">
            📤 <b>Estado:</b> borrador. El envío al cliente y la espera de su confirmación se activan cuando la base de datos esté conectada.
          </div>

          <div className="cp-what">
            Cuentan para el techo: interés + tecnología + admin + seguro-margen. Queda fuera: solo un seguro real de aseguradora. El “soporte de riesgo” son puntos que el cliente <b>gana</b> pagando — no se cobran.
          </div>
        </div>
      </div>
    </div>
  )
}
