import useCrmStore from './store'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Solicitudes from './pages/Solicitudes'
import Clientes from './pages/Clientes'
import Calculadora from './pages/Calculadora'
import Contrapropuesta from './pages/Contrapropuesta'
import ComunidadCrm from './pages/ComunidadCrm'
import Placeholder from './pages/Placeholder'
import Sidebar from './components/Sidebar'
import './crm.css'

const VIEWS = {
  dashboard:      <Dashboard />,
  solicitudes:    <Solicitudes />,
  clientes:       <Clientes />,
  calculadora:    <Calculadora />,
  contrapropuesta:<Contrapropuesta />,
  comunidad:      <ComunidadCrm />,
  mapa:           <Placeholder title="Mapa" icon="🗺️" />,
  exportar:       <Placeholder title="Exportar" icon="📤" />,
}

export default function CrmApp() {
  const { user, view } = useCrmStore()

  if (!user) return (
    <div className="theme-crm" style={{ minHeight:'100vh' }}>
      <Login />
    </div>
  )

  return (
    <div className="theme-crm crm-layout">
      <Sidebar />
      <main className="crm-main">
        {VIEWS[view] || <Dashboard />}
      </main>
    </div>
  )
}
