import { useState } from 'react'
import useClientStore from '../store'
import { TYC_HTML } from '../../shared/constants'
import './KYC.css'

export default function KYC({ pendingUser, onBack }) {
  const { finishKYC, sendOtp, checkOtp } = useClientStore()
  const [step, setStep] = useState(0)
  const [otp, setOtp] = useState({})           // solo modo demo
  const [mode, setMode] = useState({})          // por canal: 'whatsapp' | 'sms' | 'demo'
  const [otpInputs, setOtpInputs] = useState({ w: ['','','','','',''], e: ['','','','','',''] })
  const [email, setEmail] = useState('')
  const [tc1, setTc1] = useState(false)
  const [tc2, setTc2] = useState(false)
  const [tc3, setTc3] = useState(false)
  const [err, setErr] = useState('')
  const [sent, setSent] = useState({ wa: false, em: false })
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  function flashErr(msg) { setErr(msg); setTimeout(() => setErr(''), 3000) }

  // type: 'wa' (usa channel 'whatsapp'/'sms') o 'em' (email, demo)
  async function sendOTP(type, channel) {
    setErr(''); setSending(true)
    const ch = type === 'wa' ? (channel || 'whatsapp') : 'email'
    const data = await sendOtp({ tel: pendingUser.tel, email, channel: ch })
    setSending(false)
    if (data.error) { flashErr(data.error); return }
    setMode(m => ({ ...m, [type]: data.mode }))
    setSent(s => ({ ...s, [type === 'wa' ? 'wa' : 'em']: true }))
    if (data.mode === 'demo') {
      setOtp(o => ({ ...o, [type]: data.code }))
      alert(`Código (modo demo, sin WhatsApp real): ${data.code}`)
    }
  }

  async function verifyOTP(type) {
    const prefix = type === 'wa' ? 'w' : 'e'
    const entered = otpInputs[prefix].join('')
    if (entered.length < 6) { flashErr('Escribe los 6 dígitos'); return }
    const next = () => { setErr(''); setStep(type === 'wa' ? 3 : 4) }
    // Demo: se valida contra el código que generamos localmente.
    if (mode[type] === 'demo' || mode[type] === undefined) {
      if (entered === otp[type]) next()
      else flashErr('Código incorrecto')
      return
    }
    // Real: lo valida Twilio en el servidor.
    setVerifying(true)
    const data = await checkOtp({ tel: pendingUser.tel, code: entered, channel: mode[type] })
    setVerifying(false)
    if (data.error) { flashErr(data.error); return }
    if (data.ok) next()
    else flashErr('Código incorrecto')
  }

  function setOtpDigit(prefix, i, val) {
    setOtpInputs(o => {
      const next = { ...o, [prefix]: [...o[prefix]] }
      next[prefix][i] = val.slice(-1)
      return next
    })
  }

  async function handleFinish() {
    setLoading(true)
    setErr('')
    const error = await finishKYC({ ...pendingUser, email })
    setLoading(false)
    if (error) setErr(error)
  }

  const OtpRow = ({ prefix }) => (
    <div className="otpr">
      {[0,1,2,3,4,5].map(i => (
        <input key={i} className="otin" maxLength={1}
          value={otpInputs[prefix][i]}
          onChange={e => setOtpDigit(prefix, i, e.target.value)}
        />
      ))}
    </div>
  )

  const steps = [
    <div key={0} className="kstep">
      <div className="kstep-title">Foto de tu cédula</div>
      <div className="kstep-sub">Parte frontal con nombre y número visibles.</div>
      <div className="ubx"><div className="uico">🪪</div><div><div className="uptit">Cédula (frente)</div><div className="upsub">JPG o PNG</div></div></div>
      <button className="btn" style={{ marginTop: 12 }} onClick={() => setStep(1)}>Continuar →</button>
    </div>,

    <div key={1} className="kstep">
      <div className="kstep-title">Selfie con cédula</div>
      <div className="kstep-sub">Foto con cara + cédula visibles.</div>
      <div className="ubx"><div className="uico">🤳</div><div><div className="uptit">Selfie con cédula</div><div className="upsub">Cara + cédula en una foto</div></div></div>
      <button className="btn" style={{ marginTop: 12 }} onClick={() => setStep(2)}>Continuar →</button>
      <button className="btn-ghost" onClick={() => setStep(0)}>← Atrás</button>
    </div>,

    <div key={2} className="kstep">
      <div className="kstep-title">Verifica tu WhatsApp</div>
      <div className="kstep-sub">Enviamos un código a <strong style={{ color:'var(--gold)' }}>{pendingUser.tel}</strong></div>
      <button className="btn" disabled={sending} style={{ background:'rgba(37,211,102,.18)',border:'1px solid rgba(37,211,102,.3)',color:'#25D366',marginBottom:9 }} onClick={() => sendOTP('wa', 'whatsapp')}>
        {sending ? 'Enviando…' : '📲 Enviar código por WhatsApp'}
      </button>
      {sent.wa && (
        <div className="otps">
          {mode.wa === 'demo'
            ? '✅ Modo demo: revisa el aviso de arriba (aún no es WhatsApp real).'
            : mode.wa === 'sms'
              ? '✅ Código enviado por SMS. Revisa tus mensajes.'
              : '✅ Código enviado a tu WhatsApp. Revisa la app.'}
        </div>
      )}
      <OtpRow prefix="w" />
      <button className="btn" disabled={verifying} onClick={() => verifyOTP('wa')}>{verifying ? 'Verificando…' : 'Verificar'}</button>
      {sent.wa && mode.wa !== 'demo' && (
        <button className="btn-ghost" disabled={sending} onClick={() => sendOTP('wa', 'sms')}>¿No te llegó? Enviar por SMS</button>
      )}
      {err && <div className="err">{err}</div>}
      <button className="btn-ghost" onClick={() => setStep(1)}>← Atrás</button>
    </div>,

    <div key={3} className="kstep">
      <div className="kstep-title">Verifica tu correo</div>
      <div className="kstep-sub">Ingresa tu correo para recibir el código.</div>
      <div className="field"><label>Correo electrónico</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tucorreo@gmail.com" />
      </div>
      <button className="btn" style={{ marginBottom:9 }} onClick={() => { if(!email){setErr('Ingresa tu correo');return}; sendOTP('em') }}>📧 Enviar código</button>
      {sent.em && <div className="otps">✅ Código generado — revisa el aviso de arriba.</div>}
      <OtpRow prefix="e" />
      <button className="btn" onClick={() => verifyOTP('em')}>Verificar</button>
      {err && <div className="err">{err}</div>}
      <button className="btn-ghost" onClick={() => setStep(2)}>← Atrás</button>
    </div>,

    <div key={4} className="kstep">
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
    </div>,
  ]

  return (
    <div className="auth-wrap" style={{ justifyContent:'flex-start', paddingTop:22 }}>
      <span style={{ fontSize:50, display:'block', marginBottom:4, animation:'fl 3s ease-in-out infinite' }}>🤖</span>
      <div className="auth-logo" style={{ fontSize:34 }}>LUKERO</div>
      <div className="auth-tag">Verificación de identidad</div>
      <div className="auth-card" style={{ maxWidth:370 }}>
        <div className="kprog">
          {[0,1,2,3,4].map(i => (
            <div key={i} className={`kd${i === step ? ' cur' : i < step ? ' done' : ''}`} />
          ))}
        </div>
        {steps[step]}
      </div>
      <button className="btn-ghost" style={{ maxWidth:360, marginTop:12 }} onClick={onBack}>Cancelar</button>
    </div>
  )
}
