import { Routes, Route, Navigate } from 'react-router-dom'
import ClientApp from './client/ClientApp'
import CrmApp from './crm/CrmApp'
import Privacidad from './client/pages/Privacidad'

export default function App() {
  return (
    <Routes>
      {/* Pública (sin login): Google Play exige la política de privacidad en una URL abierta. */}
      <Route path="/privacidad" element={<Privacidad />} />
      <Route path="/crm/*" element={<CrmApp />} />
      <Route path="/*" element={<ClientApp />} />
    </Routes>
  )
}
