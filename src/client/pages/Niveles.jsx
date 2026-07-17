import useClientStore from '../store'
import { NV, PTS_NIVEL } from '../../shared/constants'
import { pctNivel, ptsEnNivel, ptsParaSiguiente, fmtCOP } from '../../shared/utils'
import './Niveles.css'

export default function Niveles() {
  const { user } = useClientStore()
  if (!user) return null
  const pct = pctNivel(user)
  const ptsNext = ptsParaSiguiente(user)
  const nv = NV[user.nivel - 1]

  return (
    <div className="screen-inner">
      <nav className="topnav"><div className="nav-logo">Niveles</div></nav>
      <div className="pw">
        {/* Hero nivel actual */}
        <div className="niv-hero">
          <div className="niv-badge">N{user.nivel}</div>
          <div className="niv-nom">{nv.nom}</div>
          <div className="niv-pts">{user.puntos || 0} pts totales</div>
          <div className="niv-bar-wrap">
            <div className="niv-bar" style={{ width:`${pct}%` }} />
          </div>
          <div className="niv-bar-lbl">
            <span>{ptsEnNivel(user)} pts en este nivel</span>
            {user.nivel < 20 && <span>{ptsNext} pts para N{user.nivel + 1}</span>}
          </div>
        </div>

        {/* Tips */}
        <div className="fasttip">
          <div className="ftt">🚀 ¿Cómo subir de nivel más rápido?</div>
          {[
            ['🟢','Paga anticipado:','puntos dobles y pagas MENOS interés (se recalcula por los días usados).'],
            ['🟡','Paga tus cuotas puntual:','cada cuota a tiempo suma puntos.'],
            ['📋','Completa créditos:','cada nivel pide varios créditos pagados (de 3 a 8 según el nivel).'],
            ['📲','Síguenos en redes','y gana puntos extra.'],
            ['👥','Refiere amigos:','+200 puntos por cada uno.'],
          ].map(([ico,bold,rest]) => (
            <div key={bold} className="fti"><span>{ico}</span><span><strong>{bold}</strong> {rest}</span></div>
          ))}
        </div>

        <div className="seh"><h2>Mapa de niveles</h2><p>Verde = completado · Dorado = tú · Gris = por desbloquear</p></div>

        <div className="niv-grid">
          {NV.map(n => {
            const state = n.n < user.nivel ? 'done' : n.n === user.nivel ? 'cur' : 'locked'
            return (
              <div key={n.n} className={`niv-card ${state}`}>
                <div className="niv-card-n">N{n.n}</div>
                <div className="niv-card-nom">{n.nom}</div>
                <div className="niv-card-cap">Hasta {fmtCOP(n.caps[0].m)}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
