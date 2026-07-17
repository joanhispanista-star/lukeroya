import { useState } from 'react'
import useClientStore from '../store'
import { TYC_HTML } from '../../shared/constants'
import './KYC.css'

export default function KYC({ pendingUser, onBack }) {
  const { finishKYC, validarCodigo } = useClientStore()
  const [step, setStep] = useState(0)
  const [codigo, setCodigo] = useState('')
  const [tc1, setTc1] = useState(false)
  const [tc2, setTc2] = useState(false)
  const [tc3, setTc3] = useState(false)
  const [err, setErr] = useState('')
  const [checking, setChecking] = useState(false)
  const [loading, setLoading] = useState(false)

  function flashErr(msg) { setErr(msg); setTimeout(() => setErr(''), 4000) }

  async function checkCodigo() {
    const c = codigo.trim().toUpperCase()
    if (!c) { flashErr('Escribe el código que te dieron'); return }
    setChecking(true); setErr('')
    const data = await validarCodigo(c, pendingUser.cedula)
    setChecking(false)
    if (data.error) { flashErr(data.error); return }
    setStep(2)
  }

  async function handleFinish() {
    setLoading(true); setErr('')
    const error = await finishKYC({ ...pendingUser, codigo: codigo.trim().toUpperCase() })
    setLoading(false)
    if (error) flashErr(error)
  }

  const steps = [
    <div key={0} className="kstep">
      <div className="kstep-title">Validación de identidad</div>
      <div className="kstep-sub">Para protegerte, verificamos que cada cliente es quien dice ser.</div>
      <div className="ubx"><div className="uico">🪪</div><div><div className="uptit">Ten tu cédula a la mano</div><div className="upsub">Un asesor te pedirá por WhatsApp una foto de tu cédula y una selfie antes de aprobar tu crédito.</div></div></div>
      <button className="btn" style={{ marginTop: 12 }} onClick={() => setStep(1)}>Entendido, continuar →</button>
    </div>,

    <div key={1} className="kstep">
      <div className="kstep-title">Código de acceso</div>
      <div className="kstep-sub">Ingresa el código que <strong style={{ color:'var(--gold)' }}>Lukero te entregó</strong> para activar tu cuenta.</div>
      <div className="field"><label>Código</label>
        <input
          value={codigo}
          onChange={e => setCodigo(e.target.value.toUpperCase())}
          onKeyDown={e => { if (e.key === 'Enter') checkCodigo() }}
          placeholder="LKR-XXXXXX"
          style={{ textTransform:'uppercase', letterSpacing:2, fontWeight:700, textAlign:'center' }}
        />
      </div>
      <button className="btn" disabled={checking} onClick={checkCodigo}>{checking ? 'Validando…' : 'Validar y continuar →'}</button>
      {err && <div className="err">{err}</div>}
      <div className="auth-foot" style={{ marginTop: 10 }}>¿No tienes código? Escríbenos por WhatsApp y te lo damos.</div>
      <button className="btn-ghost" onClick={() => setStep(0)}>← Atrás</button>
    </div>,

    <div key={2} className="kstep">
      <div className="kstep-title">Términos y condiciones</div>
      <div className="tcscr" dangerouslySetInnerHTML={{ __html: TYC_HTML }} />
      <label className="tcck"><input type="checkbox" checked={tc1} onChange={e => setTc1(e.target.checked)} /><span>He leído y acepto los <strong>Términos y Condiciones</strong></span></label>
      <label className="tcck"><input type="checkbox" checked={tc2} onChange={e => setTc2(e.target.checked)} /><span>Autorizo el <strong>tratamiento de mis datos personales</strong> (Ley 1581)</span></label>
      <label className="tcck"><input type="checkbox" checked={tc3} onChange={e => setTc3(e.target.checked)} /><span>La información suministrada es <strong>verídica</strong></span></label>
      {err && <div className="err">{err}</div>}
      <button className="btn" disabled={!tc1||!tc2||!tc3||loading}
        style={{ opacity: tc1&&tc2&&tc3 ? 1 : .5 }}
        onClick={handleFinish}>
        {loading ? 'Registrando...' : 'COMPLETAR REGISTRO'}
      </button>
      <button className="btn-ghost" onClick={() => setStep(1)}>← Atrás</button>
    </div>,
  ]

  return (
    <div className="auth-wrap" style={{ justifyContent:'flex-start', paddingTop:22 }}>
      <span style={{ fontSize:50, display:'block', marginBottom:4, animation:'fl 3s ease-in-out infinite' }}>🤖</span>
      <div className="auth-logo" style={{ fontSize:34 }}>LUKERO</div>
      <div className="auth-tag">Verificación de identidad</div>
      <div className="auth-card" style={{ maxWidth:370 }}>
        <div className="kprog">
          {[0,1,2].map(i => (
            <div key={i} className={`kd${i === step ? ' cur' : i < step ? ' done' : ''}`} />
          ))}
        </div>
        {steps[step]}
      </div>
      <button className="btn-ghost" style={{ maxWidth:360, marginTop:12 }} onClick={onBack}>Cancelar</button>
    </div>
  )
}
