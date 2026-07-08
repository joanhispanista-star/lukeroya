import { useState, useEffect } from 'react'
import useClientStore from '../store'
import './Mascota.css'

const PREGUNTAS = [
  'Tengo plata por si necesitas 💰',
  '¿Qué esperas para comprar eso que quieres? ✨',
  '¿Hablamos de tu situación financiera?',
  '¿Necesitas que te saque de alguna duda?',
]

export default function Mascota() {
  const { nav } = useClientStore()
  const [lado, setLado] = useState('right')   // se pasea de un lado a otro
  const [q, setQ] = useState(0)
  const [showQ, setShowQ] = useState(true)

  useEffect(() => {
    const paseo = setInterval(() => setLado(l => (l === 'right' ? 'left' : 'right')), 9000)
    const preg = setInterval(() => {
      setShowQ(false)
      setTimeout(() => { setQ(i => (i + 1) % PREGUNTAS.length); setShowQ(true) }, 450)
    }, 6500)
    return () => { clearInterval(paseo); clearInterval(preg) }
  }, [])

  return (
    <div className={`masc masc-${lado}`}>
      {showQ && (
        <div className="masc-bubble" onClick={() => nav('luka')}>
          {PREGUNTAS[q]}
          <span className="masc-bubble-tip" />
        </div>
      )}
      <button className="masc-bot" onClick={() => nav('luka')} aria-label="Hablar con Luka IA">
        <svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="mSteel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eef1f7" />
              <stop offset="0.5" stopColor="#c2c8d6" />
              <stop offset="1" stopColor="#8a91a3" />
            </linearGradient>
            <radialGradient id="mEye" cx="0.5" cy="0.4" r="0.7">
              <stop offset="0" stopColor="#d8fbff" />
              <stop offset="0.5" stopColor="#4dd7ff" />
              <stop offset="1" stopColor="#1b8fd6" />
            </radialGradient>
            <radialGradient id="mCore" cx="0.5" cy="0.5" r="0.6">
              <stop offset="0" stopColor="#fff3b0" />
              <stop offset="0.6" stopColor="#f5c518" />
              <stop offset="1" stopColor="#c78a00" />
            </radialGradient>
          </defs>

          {/* antena */}
          <line x1="60" y1="20" x2="60" y2="8" stroke="#8a91a3" strokeWidth="3" />
          <circle className="masc-antena" cx="60" cy="6" r="5" fill="url(#mCore)" />

          {/* orejas rosadas (marca Lukero) */}
          <rect x="20" y="34" width="10" height="20" rx="5" fill="#ff5b8a" />
          <rect x="90" y="34" width="10" height="20" rx="5" fill="#ff5b8a" />

          {/* brazos + pinzas */}
          <g className="masc-arm masc-arm-l">
            <line x1="34" y1="80" x2="20" y2="104" stroke="#9aa0b2" strokeWidth="6" strokeLinecap="round" />
            <g className="masc-claw" style={{ transformOrigin: '20px 104px' }}>
              <rect className="masc-prong-a" x="10" y="102" width="12" height="5" rx="2.5" fill="#b9bfce" />
              <rect className="masc-prong-b" x="10" y="107" width="12" height="5" rx="2.5" fill="#b9bfce" />
            </g>
          </g>
          <g className="masc-arm masc-arm-r">
            <line x1="86" y1="80" x2="100" y2="104" stroke="#9aa0b2" strokeWidth="6" strokeLinecap="round" />
            <g className="masc-claw" style={{ transformOrigin: '100px 104px' }}>
              <rect className="masc-prong-a" x="98" y="102" width="12" height="5" rx="2.5" fill="#b9bfce" />
              <rect className="masc-prong-b" x="98" y="107" width="12" height="5" rx="2.5" fill="#b9bfce" />
            </g>
          </g>

          {/* cabeza */}
          <rect x="30" y="20" width="60" height="44" rx="16" fill="url(#mSteel)" stroke="#727a8c" strokeWidth="1.5" />
          {/* ojos */}
          <ellipse className="masc-eye" cx="48" cy="40" rx="6.5" ry="8.5" fill="url(#mEye)" />
          <ellipse className="masc-eye" cx="72" cy="40" rx="6.5" ry="8.5" fill="url(#mEye)" />
          {/* boca / rejilla */}
          <rect x="49" y="53" width="22" height="5" rx="2.5" fill="#3a4150" />

          {/* cuerpo */}
          <rect x="34" y="66" width="52" height="50" rx="15" fill="url(#mSteel)" stroke="#727a8c" strokeWidth="1.5" />
          <circle className="masc-core" cx="60" cy="90" r="9" fill="url(#mCore)" />
        </svg>
      </button>
    </div>
  )
}
