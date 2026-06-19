import useClientStore from '../store'
import { NV } from '../../shared/constants'
import { pctNivel, ptsEnNivel, ptsParaSiguiente } from '../../shared/utils'
import './Perfil.css'

export default function Perfil() {
  const { user, logout } = useClientStore()
  if (!user) return null
  const nv = NV[user.nivel - 1]

  return (
    <div className="screen-inner">
      <nav className="topnav"><div className="nav-logo">Mi Perfil</div></nav>
      <div className="pw">
        <div className="perf-hero">
          <div className="perf-avatar">👤</div>
          <div className="perf-nom">{user.nombre}</div>
          <div className="perf-sub">{user.ciudad || 'Colombia'}</div>
          <div className="perf-badge">N{user.nivel} · {nv.nom}</div>
        </div>
        <div className="card">
          {[['Cédula',user.cedula],['Teléfono',user.tel],['Email',user.email||'-'],['Registro',user.fechaReg],['Créditos completados',user.creds||0],['Puntos totales',user.puntos||0]].map(([k,v]) => (
            <div key={k} className="perf-row"><span className="perf-k">{k}</span><span className="perf-v">{v}</span></div>
          ))}
        </div>
        <div className="card">
          <div className="ctitle">📊 Progreso de nivel</div>
          <div className="niv-bar-wrap"><div className="niv-bar" style={{ width:`${pctNivel(user)}%` }} /></div>
          <div className="niv-bar-lbl">
            <span>{ptsEnNivel(user)} pts en N{user.nivel}</span>
            {user.nivel < 20 && <span>{ptsParaSiguiente(user)} pts para N{user.nivel+1}</span>}
          </div>
        </div>
        <button className="btn-logout-big" onClick={logout}>Cerrar sesión</button>
      </div>
    </div>
  )
}
