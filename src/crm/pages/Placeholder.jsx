import './Dashboard.css'

export default function Placeholder({ title, icon = '🚧' }) {
  return (
    <div className="view active">
      <div className="page-header">
        <div className="page-title">{title}</div>
      </div>
      <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text3)' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>{icon}</div>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16 }}>En construcción</div>
        <div style={{ fontSize:13, marginTop:6 }}>Esta sección estará disponible próximamente.</div>
      </div>
    </div>
  )
}
