import { useState, useEffect, useRef } from 'react'
import useClientStore from '../store'
import './Chat.css'

const QUICK = [
  '¿Cómo mejorar mi historial crediticio?',
  '¿Cómo ahorrar con ingresos bajos?',
  '¿Vale la pena pagar anticipado?',
  '¿Cómo salir de deudas?',
]

export default function Finn() {
  const { user } = useClientStore()
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [showQuick, setShowQuick] = useState(true)
  const msgsRef = useRef(null)

  useEffect(() => {
    const nombre = user?.nombre?.split(' ')[0] || ''
    setMsgs([{ role:'bot', text:`¡Hola ${nombre}! 🧠 Soy <strong>Finn</strong>, tu asesor financiero independiente. No te vendo nada — solo consejos honestos para mejorar tu salud financiera.` }])
    setHistory([
      { role:'user', content:'(usuario abre asesor)' },
      { role:'assistant', content:`Hola ${nombre}! Soy Finn. ¿En qué te ayudo?` }
    ])
  }, [])

  useEffect(() => { msgsRef.current?.scrollTo(0, msgsRef.current.scrollHeight) }, [msgs])

  function getSysPrompt() {
    return `Eres FINN, asesor financiero personal independiente de Lukero (Colombia).
CLIENTE: ${user?.nombre}, N${user?.nivel} Lukero, ${user?.creds||0} créditos.
ROL: Consejos financieros honestos y prácticos para colombianos. Ahorro, deudas, Datacrédito, emergencias. NO presionar a tomar créditos. SÍ mencionar que pagar anticipado en Lukero da descuentos y sube nivel. Citar leyes colombianas cuando aplique.
TONO: Español colombiano informal, empático, directo, max 4 oraciones.`
  }

  async function send(text) {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setShowQuick(false)
    const tempId = Date.now()
    setMsgs(m => [...m, { role:'user', text: msg }, { role:'bot', text:'...', id: tempId }])
    const newHistory = [...history, { role:'user', content: msg }]
    setHistory(newHistory)
    try {
      const r = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model:'claude-sonnet-5', max_tokens:700, thinking:{ type:'disabled' }, system:getSysPrompt(), messages:newHistory.slice(-8) })
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const d = await r.json()
      const rep = d.content?.find(b => b.type==='text')?.text || 'Sin respuesta.'
      setHistory(h => [...h, { role:'assistant', content:rep }])
      setMsgs(m => m.map(x => x.id === tempId ? { role:'bot', text:rep } : x))
    } catch(e) {
      setMsgs(m => m.map(x => x.id === tempId ? { role:'bot', text:`Error: ${e.message}` } : x))
    }
  }

  return (
    <div className="chat-screen">
      <div className="chdr">
        <div className="cav" style={{ background:'rgba(59,130,246,.2)' }}>🧠</div>
        <div><div className="cbn" style={{ color:'var(--blue2)' }}>FINN</div><div className="cbs">Asesor Financiero Independiente</div></div>
        <div className="onl" style={{ background:'var(--blue)' }} />
      </div>
      <div className="chatmsgs" ref={msgsRef}>
        {msgs.map((m,i) => (
          <div key={i} className={`msg ${m.role}`} style={m.role==='bot'?{borderColor:'rgba(59,130,246,.22)'}:{}}
            dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g,'<br/>') }} />
        ))}
      </div>
      {showQuick && (
        <div className="qqs">{QUICK.map(q => <button key={q} className="qq" onClick={() => send(q)}>{q}</button>)}</div>
      )}
      <div className="cinbar">
        <input className="cin" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Consúltale a Finn..." onKeyDown={e => e.key==='Enter' && send()} />
        <button className="csend sf" onClick={() => send()}>↑</button>
      </div>
    </div>
  )
}
