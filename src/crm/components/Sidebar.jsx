import useCrmStore from '../store'
import './Sidebar.css'

const NAV = [
  { section:'Principal', items:[
    { key:'dashboard',    icon:'📊', label:'Dashboard'     },
    { key:'solicitudes',  icon:'📋', label:'Solicitudes'   },
    { key:'clientes',     icon:'👥', label:'Clientes'      },
    { key:'comunidad',    icon:'⭐', label:'Comunidad'     },
  ]},
  { section:'Herramientas', items:[
    { key:'calculadora',     icon:'🧮', label:'Calculadora'    },
    { key:'contrapropuesta', icon:'📝', label:'Contrapropuesta' },
    { key:'mapa',            icon:'🗺️', label:'Mapa'           },
    { key:'exportar',        icon:'📤', label:'Exportar'       },
  ]},
]

const ROL_CLASS = { owner:'role-owner', admin:'role-admin', asesor:'role-asesor', ventas:'role-ventas' }

export default function Sidebar() {
  const { user, view, goTo, logout } = useCrmStore()
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="name">CRM · Lukero</div>
        <div className="sub">Sistema de Cobranzas</div>
      </div>
      <div className="sidebar-user">
        <div style={{ fontWeight:600, fontSize:14, marginBottom:5 }}>{user?.name}</div>
        <span className={`role-badge ${ROL_CLASS[user?.rol] || ''}`}>{user?.rol}</span>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(section => (
          <div key={section.section}>
            <div className="nav-section">{section.section}</div>
            {section.items.map(it => (
              <div key={it.key} className={`nav-item${view === it.key ? ' active' : ''}`} onClick={() => goTo(it.key)}>
                <span className="icon">{it.icon}</span>{it.label}
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="btn-logout" onClick={logout}>Cerrar sesión</button>
      </div>
    </div>
  )
}
