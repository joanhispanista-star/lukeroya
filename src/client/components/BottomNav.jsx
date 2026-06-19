import useClientStore from '../store'
import './BottomNav.css'

const TABS = [
  { key:'home',  icon:'🏠', label:'Inicio'  },
  { key:'cred',  icon:'💳', label:'Crédito' },
  { key:'niv',   icon:'⭐', label:'Niveles' },
  { key:'luka',  icon:'🤖', label:'Luka IA' },
  { key:'more',  icon:'☰',  label:'Más'     },
]

export default function BottomNav() {
  const { screen, nav, toggleMore } = useClientStore()
  return (
    <nav className="bottom-nav">
      {TABS.map(t => (
        <div
          key={t.key}
          className={`bn${screen === t.key ? ' active' : ''}`}
          onClick={() => t.key === 'more' ? toggleMore() : nav(t.key)}
        >
          <span className="bi">{t.icon}</span>
          <span className="bl">{t.label}</span>
        </div>
      ))}
    </nav>
  )
}
