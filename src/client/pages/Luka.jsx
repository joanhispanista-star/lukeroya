import { useState, useEffect, useRef } from 'react'
import useClientStore from '../store'
import { NV } from '../../shared/constants'
import './Chat.css'

const QUICK = [
  '¿Cuánto debo en mi crédito activo?',
  '¿Cómo subo de nivel más rápido?',
  '¿Qué pasa si no puedo pagar?',
  '¿Qué es una prórroga?',
]

export default function Luka() {
  const { user } = useClientStore()
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [showQuick, setShowQuick] = useState(true)
  const msgsRef = useRef(null)

  useEffect(() => {
    const nombre = user?.nombre?.split(' ')[0] || ''
    setMsgs([{ role:'bot', text:`¡Hola ${nombre}! 🤖 Soy LUKA, tu asistente Lukero. ¿En qué te puedo ayudar?` }])
    setHistory([
      { role:'user', content:'(usuario abre chat)' },
      { role:'assistant', content:`¡Hola ${nombre}! Soy LUKA. ¿En qué te ayudo?` }
    ])
  }, [])

  useEffect(() => {
    msgsRef.current?.scrollTo(0, msgsRef.current.scrollHeight)
  }, [msgs])

  function getSysPrompt() {
    const ca = user?.creditoActivo
    return `Eres LUKA, asistente IA de Lukero (NEXECO SAS, Colombia).
CLIENTE: ${user?.nombre}, N${user?.nivel} (${NV[(user?.nivel||1)-1]?.nom}), ${user?.puntos||0} puntos, ${user?.creds||0} créditos.
CRÉDITO: ${ca && ca.estado!=='pagado' ? `$${Number(ca.capital).toLocaleString('es-CO')} · total $${Number(ca.totalPagar).toLocaleString('es-CO')} · vence ${ca.fechaVence} · ${ca.estado}` : 'Sin crédito activo.'}
MODELO: 30% total. Plazo 8 días. Prórroga +3 días (desde N2). Mora 1% diario. Descuentos: 3+ días antes=póliza+interés gratis, 2 días=póliza gratis, 1 día=50% tech, día de pago mañana=40% tech. 20 niveles hasta $10M. Mínimo 3 créditos por nivel.
TONO: Español colombiano informal, empático, max 3-4 oraciones.`
  }

  async function send(text) {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setShowQuick(false)
    const userMsg = { role:'user', text: msg }
    const tempId = Date.now()
    setMsgs(m => [...m, userMsg, { role:'bot', text:'...', id: tempId }])
    const newHistory = [...history, { role:'user', content: msg }]
    setHistory(newHistory)

    try {
      const r = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model:'claude-sonnet-5', max_tokens:700, thinking:{ type:'disabled' }, system: getSysPrompt(), messages: newHistory.slice(-8) })
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const d = await r.json()
      const rep = d.content?.find(b => b.type === 'text')?.text || 'Sin respuesta.'
      setHistory(h => [...h, { role:'assistant', content: rep }])
      setMsgs(m => m.map(x => x.id === tempId ? { role:'bot', text: rep } : x))
    } catch (e) {
      setMsgs(m => m.map(x => x.id === tempId ? { role:'bot', text: `Error: ${e.message}` } : x))
    }
  }

  return (
    <div className="chat-screen">
      <div className="chdr">
        <div className="cav av-l">🤖</div>
        <div><div className="cbn" style={{ color:'var(--gold)' }}>LUKA</div><div className="cbs">Asistente Lukero</div></div>
        <div className="onl" style={{ background:'var(--green)' }} />
      </div>
      <div className="chatmsgs" ref={msgsRef}>
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role}`} dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g,'<br/>') }} />
        ))}
      </div>
      {showQuick && (
        <div className="qqs">
          {QUICK.map(q => <button key={q} className="qq" onClick={() => send(q)}>{q}</button>)}
        </div>
      )}
      <div className="cinbar">
        <input className="cin" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Pregúntale a Luka..."
          onKeyDown={e => e.key === 'Enter' && send()} />
        <button className="csend sl" onClick={() => send()}>↑</button>
      </div>
    </div>
  )
}
