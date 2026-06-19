import { useState, useRef } from 'react'
import useClientStore from '../store'
import { TYC_HTML } from '../../shared/constants'
import './KYC.css'

export default function KYC({ pendingUser, onBack }) {
  const { finishKYC } = useClientStore()
  const [step, setStep] = useState(0)
  const [otp, setOtp] = useState({})
  const [otpInputs, setOtpInputs] = useState({ w: ['','','','','',''], e: ['','','','','',''] })
  const [email, setEmail] = useState('')
  const [tc1, setTc1] = useState(false)
  const [tc2, setTc2] = useState(false)
  const [tc3, setTc3] = useState(false)
  const [err, setErr] = useState('')
  const [sent, setSent] = useState({ wa: false, em: false })

  function sendOTP(type) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setOtp(o => ({ ...o, [type]: code }))
    setSent(s => ({ ...s, [type === 'wa' ? 'wa' : 'em']: true }))
    alert(`Código OTP (demo): ${code}`)
  }

  function verifyOTP(type) {
    const prefix = type === 'wa' ? 'w' : 'e'
    const entered = otpInputs[prefix].join('')
    if (entered === otp[type]) {
      setErr('')
      setStep(type === 'wa' ? 3 : 4)
    } else {
      setErr('Código incorrecto')
      setTimeout(() => setErr(''), 3000)
    }
  }

  function setOtpDigit(prefix, i, val) {
    setOtpInputs(o => {
      const next = { ...o, [prefix]: [...o[prefix]] }
      next[prefix][i] = val.slice(-1)
      return next
    })
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
    // 0: foto cédula
    <div key={0} className="kstep">
      <div className="kstep-title">Foto de tu cédula</div>
      <div className="kstep-sub">Parte frontal con nombre y número visibles.</div>
      <div className="ubx"><div className="uico">🪪</div><div><div className="uptit">Cédula (frente)</div><div className="upsub">JPG o PNG</div></div></div>
      <button className="btn" style={{ marginTop: 12 }} onClick={() => setStep(1)}>Continuar →</button>
    </div>,
    // 1: selfie
    <div key={1} className="kstep">
      <div className="kstep-title">Selfie con cédula</div>
      <div className="kstep-sub">Foto con cara + cédula visibles.</div>
      <div className="ubx"><div className="uico">🤳</div><div><div className="uptit">Selfie con cédula</div><div className="upsub">Cara + cédula en una foto</div></div></div>
      <button className="btn" style={{ marginTop: 12 }} onClick={() => setStep(2)}>Continuar →</button>
      <button className="btn-ghost" onClick={() => setStep(0)}>← Atrás</button>
    </div>,
    // 2: OTP WhatsApp
    <div key={2} className="kstep">
      <div className="kstep-title">Verifica tu WhatsApp</div>
      <div className="kstep-sub">Enviamos un código a <strong style={{ color:'var(--gold)' }}>{pendingUser.tel}</strong></div>
      <button className="btn" style={{ background:'rgba(37,211,102,.18)',border:'1px solid rgba(37,211,102,.3)',color:'#25D366',marginBottom:9 }} onClick={() => sendOTP('wa')}>
        📲 Enviar código WhatsApp
      </button>
      {sent.wa && <div className="otps">✅ Código generado — revisa el aviso de arriba.</div>}
      <OtpRow prefix="w" />
      <button className="btn" onClick={() => verifyOTP('wa')}>Verificar</button>
      {err && <div className="err">{err}</div>}
      <button className="btn-ghost" onClick={() => setStep(1)}>← Atrás</button>
    </div>,
    // 3: OTP email
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
    // 4: T&C
    <div key={4} className="kstep">
      <div className="kstep-title">Términos y condiciones</div>
      <div className="tcscr" dangerouslySetInnerHTML={{ __html: TYC_HTML }} />
      <label className="tcck"><input type="checkbox" checked={tc1} onChange={e => setTc1(e.target.checked)} /><span>He leído y acepto los <strong>Términos y Condiciones</strong></span></label>
      <label className="tcck"><input type="checkbox" checked={tc2} onChange={e => setTc2(e.target.checked)} /><span>Autorizo el <strong>tratamiento de mis datos personales</strong> (Ley 1581)</span></label>
      <label className="tcck"><input type="checkbox" checked={tc3} onChange={e => setTc3(e.target.checked)} /><span>La información suministrada es <strong>verídica</strong></span></label>
      <button className="btn" disabled={!tc1||!tc2||!tc3} style={{ opacity: tc1&&tc2&&tc3 ? 1 : .5 }}
        onClick={() => finishKYC({ ...pendingUser, email })}>
        COMPLETAR REGISTRO
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
