import useClientStore from '../store'
import { TYC_HTML } from '../../shared/constants'

export default function TyC() {
  const { nav } = useClientStore()
  return (
    <div className="screen-inner">
      <nav className="topnav" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div className="nav-logo" style={{ cursor:'pointer' }} onClick={() => nav('home')}>‹ Volver</div>
        <div style={{ fontSize:12, color:'var(--text2)' }}>NEXECO SAS</div>
      </nav>
      <div style={{ padding:'20px 16px', fontSize:13, color:'var(--text2)', lineHeight:1.7 }}
        dangerouslySetInnerHTML={{ __html: TYC_HTML }} />
    </div>
  )
}
