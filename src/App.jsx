import { Routes, Route, Navigate } from 'react-router-dom'
import ClientApp from './client/ClientApp'
import CrmApp from './crm/CrmApp'

export default function App() {
  return (
    <Routes>
      <Route path="/crm/*" element={<CrmApp />} />
      <Route path="/*" element={<ClientApp />} />
    </Routes>
  )
}
