import { useState, useEffect } from 'react'
import useClientStore from '../store'
import './Comunidad.css'

const REDES = [
  { key: 'fb', label: 'Facebook',  icon: '📘', url: 'https://facebook.com/lukero',   pts: 100 },
  { key: 'tk', label: 'TikTok',    icon: '🎵', url: 'https://tiktok.com/@lukero',    pts: 100 },
  { key: 'ig', label: 'Instagram', icon: '📸', url: 'https://instagram.com/lukero',  pts: 100 },
]

function ComCard({ c, destacado }) {
  const n = (c.estrellas || 5)
  return (
    <div className={`card com-card${destacado ? ' dest' : ''}`}>
      <div className="com-card-top">
        <div className="com-avatar">{(c.nombre || '?').charAt(0).toUpperCase()}</div>
        <div>
          <div className="com-name">
            {c.nombre}{destacado && <span className="com-badge">✓ Verificado</span>}
          </div>
          <div className="com-stars-static">{'★'.repeat(n)}<span className="off">{'★'.repeat(5 - n)}</span></div>
        </div>
      </div>
      <div className="com-text">{c.texto}</div>
      {c.redSocial && <div className="com-red-handle">{c.redSocial}</div>}
    </div>
  )
}

export default function Comunidad() {
  const { user, comentarios, fetchComentarios, submitComentario, claimSocial, showToast } = useClientStore()
  const [estrellas, setEstrellas] = useState(5)
  const [texto, setTexto] = useState('')
  const [red, setRed] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => { fetchComentarios() }, [])

  const seguir = (r) => {
    window.open(r.url, '_blank', 'noopener')
    claimSocial(r.key, r.pts)
  }

  async function enviar() {
    if (!texto.trim()) { showToast('Escribe tu experiencia'); return }
    setEnviando(true)
    const err = await submitComentario({
      cedula: user?.cedula || '', nombre: user?.nombre || 'Cliente Lukero',
      texto, estrellas, redSocial: red,
    })
    setEnviando(false)
    if (err) { showToast(err); return }
    setTexto(''); setRed(''); setEstrellas(5)
    showToast('¡Gracias por tu opinión! 🎉')
  }

  const destacados = comentarios.filter(c => c.destacado)
  const resto = comentarios.filter(c => !c.destacado)

  return (
    <div className="screen-inner">
      <nav className="topnav"><div className="nav-logo">Comunidad</div></nav>
      <div className="pw">
        {/* Redes sociales */}
        <div className="card">
          <div className="ctitle">📲 Síguenos y gana puntos</div>
          <div className="com-redes">
            {REDES.map(r => {
              const seguido = !!user?.social?.[r.key]
              return (
                <button key={r.key} className={`com-red${seguido ? ' done' : ''}`} onClick={() => seguir(r)}>
                  <span className="com-red-ico">{r.icon}</span>
                  <span className="com-red-lbl">{r.label}</span>
                  <span className="com-red-pts">{seguido ? '✓ Seguido' : `+${r.pts} pts`}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Deja tu experiencia */}
        <div className="card">
          <div className="ctitle">✍️ Deja tu experiencia</div>
          <div className="com-stars">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} className={`com-star${n <= estrellas ? ' on' : ''}`} onClick={() => setEstrellas(n)}>★</button>
            ))}
          </div>
          <textarea className="com-textarea" placeholder="Cuéntanos cómo te fue con Lukero..."
            value={texto} maxLength={500} onChange={e => setTexto(e.target.value)} />
          <input className="com-input" placeholder="Tu @usuario en redes (opcional)"
            value={red} onChange={e => setRed(e.target.value)} />
          <button className="btna" onClick={enviar} disabled={enviando}>
            {enviando ? 'Enviando...' : 'PUBLICAR OPINIÓN'}
          </button>
          <div className="com-hint">Al seguirnos y comentar validamos tu cuenta y mejoras tus condiciones. 💛</div>
        </div>

        {/* Testimonios destacados */}
        {destacados.length > 0 && <div className="seh"><h2>Lo que dicen nuestros clientes</h2></div>}
        {destacados.map(c => <ComCard key={c.id} c={c} destacado />)}

        {/* Opiniones recientes */}
        {resto.length > 0 && <div className="seh" style={{ marginTop: 14 }}><h2>Opiniones recientes</h2></div>}
        {resto.map(c => <ComCard key={c.id} c={c} />)}
      </div>
    </div>
  )
}
