import useClientStore from '../store'
import { copyText } from '../../shared/utils'
import './Red.css'

const REDES = [
  { key:'ig', ico:'📸', nom:'Instagram', handle:'@lukero.co · próximamente', pts:150, btn:'Seguir' },
  { key:'fb', ico:'📘', nom:'Facebook',  handle:'@lukero.co · próximamente', pts:100, btn:'Me gusta' },
  { key:'tt', ico:'🎵', nom:'TikTok',    handle:'@lukero.co · próximamente', pts:150, btn:'Seguir' },
  { key:'yt', ico:'▶️', nom:'YouTube',   handle:'Lukero · próximamente', pts:100, btn:'Suscribirse' },
]

export default function Red() {
  const { user, claimSocial } = useClientStore()
  const refCod = user ? `LK-${String(user.cedula).slice(-5)}` : 'LK-XXXXX'

  return (
    <div className="screen-inner">
      <nav className="topnav"><div className="nav-logo">Gana con Lukero</div></nav>
      <div className="pw">
        <div className="rbanner"><div className="rbpts">+500 PTS</div><div style={{ fontSize:13,color:'var(--text2)',marginTop:3 }}>Sigue nuestras redes · acelera tu nivel</div></div>
        <div className="seh"><h2>📲 Síguenos y gana puntos</h2></div>
        {REDES.map(r => (
          <div key={r.key} className="socc">
            <div className="socico">{r.ico}</div>
            <div><div className="socn">{r.nom}</div><div className="soch">{r.handle}</div><div className="socr">+{r.pts} puntos</div></div>
            <button className={`socbtn${user?.sc?.[r.key] ? ' done' : ''}`}
              onClick={() => claimSocial(r.key, r.pts)}>
              {user?.sc?.[r.key] ? '✓ Listo' : r.btn}
            </button>
          </div>
        ))}
        <div className="card">
          <div className="ctitle">👥 Código de referido</div>
          <div style={{ fontSize:13,color:'var(--text2)',marginBottom:9 }}>Comparte tu código y gana <strong style={{ color:'var(--gold)' }}>+200 puntos</strong> por cada amigo que complete su primer crédito.</div>
          <div className="ref-box">
            <span className="ref-cod">{refCod}</span>
            <button className="cpbtn" onClick={() => copyText(refCod, 'Código').then(ok => ok && alert('Copiado ✓'))}>Copiar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
