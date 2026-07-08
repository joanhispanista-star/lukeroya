import useClientStore from './store'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Credito from './pages/Credito'
import Historial from './pages/Historial'
import Niveles from './pages/Niveles'
import Luka from './pages/Luka'
import Finn from './pages/Finn'
import Red from './pages/Red'
import Perfil from './pages/Perfil'
import Solicitar from './pages/Solicitar'
import Nosotros from './pages/Nosotros'
import Comunidad from './pages/Comunidad'
import TyC from './pages/TyC'
import BottomNav from './components/BottomNav'
import MoreSheet from './components/MoreSheet'
import Toast from './components/Toast'
import Mascota from './components/Mascota'
import './client.css'

const SCREENS = {
  home: Home, cred: Credito, hist: Historial,
  niv: Niveles, luka: Luka, finn: Finn,
  red: Red, perfil: Perfil, sol: Solicitar,
  nos: Nosotros, comunidad: Comunidad, tyc: TyC,
}

const CHAT_SCREENS = ['luka', 'finn']

export default function ClientApp() {
  const { user, screen } = useClientStore()

  if (!user) return (
    <div className="theme-client client-shell">
      <Auth />
    </div>
  )

  const Screen = SCREENS[screen] || Home
  const isChat = CHAT_SCREENS.includes(screen)

  return (
    <div className="theme-client client-shell">
      {isChat
        ? <Screen />
        : <div className="client-scroll"><Screen /></div>
      }
      {!isChat && <Mascota />}
      <BottomNav />
      <MoreSheet />
      <Toast />
    </div>
  )
}
