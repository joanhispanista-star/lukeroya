import { useState, useMemo } from 'react'
import { TECHO_EA, MESES_OPCIONES } from '../../shared/constants'
import { fmtCOP, tasaMensual } from '../../shared/utils'
import './Calculadora.css'
import './Contrapropuesta.css'

const REGIMENES = [
  { key: 'consumo',       label: 'Consumo y ordinario',     techo: TECHO_EA * 100, nota: 'Jul 2026 ≈ 28,79% E.A. Base para una SAS con recursos propios (sincronizado con el código).' },
  { key: 'microcredito',  label: 'Microcrédito productivo', techo: 87.72, nota: 'Jul 2026. Destino microempresa; admite comisión MiPyme aparte.' },
  { key: 'personalizado', label: 'Personalizado',           techo: null,  nota: 'Techo manual que confirme tu abogado.' },
]

function fmtPct(x) {
  const p = x * 100
  if (!isFinite(p)) return '—'
  return p.toLocaleString('es-CO', { maximumFractionDigits: 2 }) + ' %'
}

// El asesor fija el precio POR CLIENTE (según su riesgo) con una sola perilla: la
// Tasa E.A. — siempre en verde. El modelo vigente no admite cargos de tecnología/
// admin/seguro (TYC 3.0: el único costo es el interés).
export default function Contrapropuesta() {
  const [nombre, setNombre]         = useState('')
  const [cedula, setCedula]         = useState('')
  const [montoSolic, setMontoSolic] = useState(200000)
  const [montoAprob, setMontoAprob] = useState(200000)
  const [meses, setMeses]           = useState(3)
  const [interesEA, setInteresEA]   = useState(26)      // % E.A. — la única perilla de precio
  const [regimen, setRegimen]       = useState('consumo')
  const [techo, setTecho]           = useState(Math.round(TECHO_EA * 10000) / 100)
  const [soporte, setSoporte]       = useState(0)       // puntos de "soporte de riesgo" del cliente
  const [codeudores, setCodeudores] = useState(false)
  const [ced1, setCed1]             = useState('')
  const [ced2, setCed2]             = useState('')

  const r = useMemo(() => {
    const cap = Number(montoAprob) || 0
    const n   = Math.max(1, Math.round(Number(meses) || 3))
    const eaBase = (Number(interesEA) || 0) / 100
    const ea  = codeudores ? eaBase * 0.75 : eaBase

    const im    = tasaMensual(ea)
    const cuota = im > 0 ? Math.round(cap * im / (1 - Math.pow(1 + im, -n))) : Math.round(cap / n)
    const totalPagar = cuota * n
    const interes = totalPagar - cap

    const techoR = (Number(techo) || 0) / 100
    const legal  = ea > 0 && ea <= techoR

    const imMax    = tasaMensual(techoR)
    const cuotaMax = imMax > 0 ? Math.round(cap * imMax / (1 - Math.pow(1 + imMax, -n))) : Math.round(cap / n)
    const interesMaxLegal = Math.max(0, cuotaMax * n - cap)

    const fv = new Date()
    fv.setMonth(fv.getMonth() + n)
    const ultimaCuota = fv.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

    return { cap, n, ea, cuota, interes, totalPagar, techoR, legal, interesMaxLegal, ultimaCuota }
  }, [montoAprob, meses, interesEA, codeudores, techo])

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
        <div className="page-title">Generar contrapropuesta</div>
        <div className="page-sub">El asesor fija el precio por cliente (según su riesgo) — siempre con el semáforo en verde</div>
      </div>

      <div className="calc-disclaimer">
        ⚖️ La única perilla de precio es la <b>Tasa E.A.</b> (el TYC vigente no permite cargos de tecnología,
        administración ni seguros). Cliente riesgoso = menos monto, codeudores o tasa hasta el techo — <b>nunca en rojo</b>.
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
            <label className="calc-field"><span>Plazo (meses)</span>
              <select value={meses} onChange={e => setMeses(e.target.value)}>
                {MESES_OPCIONES.map(m => <option key={m} value={m}>{m} meses</option>)}
                <option value={9}>9 meses</option>
                <option value={12}>12 meses</option>
              </select></label>
            <label className="calc-field"><span>Soporte de riesgo (pts)</span>
              <input type="number" value={soporte} onChange={e => setSoporte(e.target.value)} /></label>
          </div>
          {Number(soporte) > 0 && <div className="calc-note">Este cliente ya ganó {Number(soporte).toLocaleString('es-CO')} pts de soporte de riesgo → puedes aprobarle un monto mayor o mejor tasa.</div>}

          <div className="cp-sep">Precio</div>

          <label className="calc-field">
            <span>Tasa E.A. (%) — la única perilla</span>
            <input type="number" step="0.5" value={interesEA} onChange={e => setInteresEA(e.target.value)} />
          </label>

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

          <div className="cp-sep">Codeudores (garantía)</div>
          <label className="cp-check">
            <input type="checkbox" checked={codeudores} onChange={e => setCodeudores(e.target.checked)} />
            El cliente aporta <b>2 codeudores</b> con documentos y contrato firmado → la tasa baja 25%
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
              <div className="calc-hero-label">Cuota mensual × {r.n} · última {r.ultimaCuota}</div>
              <div className="calc-hero-value">{fmtCOP(r.cuota)}</div>
            </div>
            <div className={`calc-legal ${r.legal ? 'ok' : 'bad'}`}>
              {r.legal ? '✓ Dentro del techo' : '✕ Excede el techo'}
            </div>
          </div>

          <table className="calc-breakdown">
            <tbody>
              <tr><td>Monto aprobado</td><td>{fmtCOP(r.cap)}</td></tr>
              <tr><td>Interés total ({fmtPct(r.ea)} E.A.)</td><td>{fmtCOP(r.interes)}</td></tr>
              <tr className="calc-row-strong"><td>Total a pagar</td><td>{fmtCOP(r.totalPagar)} · {r.n} cuotas</td></tr>
            </tbody>
          </table>

          <div className={`calc-ea ${r.legal ? 'ok' : 'bad'}`} style={{ marginBottom: 16 }}>
            <div className="calc-ea-label">Tasa Efectiva Anual del plan (lo que mide la ley)</div>
            <div className="calc-ea-value">{fmtPct(r.ea)}</div>
            <div className="calc-ea-sub">Techo: {fmtPct(r.techoR)} E.A. · Interés máx. legal para {r.n} meses: {fmtCOP(r.interesMaxLegal)}</div>
          </div>

          {!r.legal && (
            <div className="cp-warn">⚠️ Esta contrapropuesta supera el techo de usura. Baja la tasa, pide codeudores o alarga el plazo hasta que el semáforo quede verde.</div>
          )}

          <div className="cp-status">
            📤 <b>Estado:</b> borrador. Comunícale estas condiciones al cliente por WhatsApp; si acepta, él
            confirma la solicitud en la app y tú la apruebas en "Solicitudes".
          </div>

          <div className="cp-what">
            El "soporte de riesgo" son puntos que el cliente <b>gana</b> pagando bien — no es un cobro. El riesgo
            se maneja con monto, codeudores y tasa <b>bajo el techo</b>, nunca por encima.
          </div>
        </div>
      </div>
    </div>
  )
}
