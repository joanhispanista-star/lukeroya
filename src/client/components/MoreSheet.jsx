import useClientStore from '../store'
import './MoreSheet.css'

const ITEMS = [
  { key:'comunidad', icon:'⭐', label:'Comunidad'          },
  { key:'hist',   icon:'📋', label:'Historial'          },
  { key:'finn',   icon:'🧠', label:'Asesor Financiero'  },
  { key:'nos',    icon:'🏢', label:'Quiénes somos'      },
  { key:'tyc',    icon:'📄', label:'T&C'                },
  { key:'perfil', icon:'👤', label:'Mi Perfil'          },
]

export default function MoreSheet() {
  const { moreOpen, nav, closeMore, user } = useClientStore()
  return (
    <>
      {moreOpen && <div className="more-overlay" onClick={closeMore} />}
      <div className={`more-sheet${moreOpen ? ' on' : ''}`}>
        <div className="mh" />
        <div className="mgrid">
          {ITEMS.map(it => (
            <button key={it.key} className="mbtn" onClick={() => nav(it.key)}>
              <span style={{ fontSize: 17 }}>{it.icon}</span>{it.label}
            </button>
          ))}
        </div>
      </div>
      {user && (
        <button className="wa-btn" onClick={() => {
          const n = user.nombre?.split(' ')[0] || 'cliente'
          window.open(`https://wa.me/573000000000?text=${encodeURIComponent('Hola Lukero! Soy ' + n + ' y necesito ayuda.')}`, '_blank')
        }}>💬</button>
      )}
    </>
  )
}
