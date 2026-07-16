import { copyText } from '../../shared/utils'
import './Nosotros.css'

export default function Nosotros() {
  return (
    <div className="screen-inner">
      <nav className="topnav"><div className="nav-logo">Lukero</div></nav>
      <div className="pw">
        <div className="mhero"><div className="mhico">🤖</div><div className="mhtit">Inclusión financiera para todos</div><div className="mhtx">En Lukero creemos que el acceso al crédito no debería depender de cuánto tiempo llevas en el sistema bancario.</div></div>
        <div className="sgrid">
          {[['100%','Digital · sin filas'],['3–6','meses · a cuotas'],['20','niveles de fidelidad'],['$10M','máximo disponible']].map(([n,l]) => (
            <div key={l} className="sbox"><div className="sbn">{n}</div><div className="sbl">{l}</div></div>
          ))}
        </div>
        <div className="card"><div className="ctitle">🎯 Nuestra misión</div><p style={{ fontSize:13,color:'var(--text2)',lineHeight:1.7 }}>Democratizar el acceso al crédito en Colombia. Millones no tienen historial crediticio — Lukero nació para ellos.</p></div>
        <div className="card"><div className="ctitle">🏢 NEXECO SAS</div><p style={{ fontSize:13,color:'var(--text2)',lineHeight:1.7 }}>Empresa de tecnología financiera colombiana, domiciliada en Bogotá D.C. Operamos con recursos propios bajo el marco legal del Código de Comercio.</p></div>
        <div className="card"><div className="ctitle">🔒 Cuenta oficial de pago</div>
          <div className="bkc">
            <div className="bkh"><div className="bkl">⚡</div><div><div className="bkn">Bre-B · Llave</div><div className="bkt">Titular: Joan Sebastián Ruiz Flórez</div></div></div>
            <div className="bkr"><span className="bkrl">Llave</span><span className="bkrv">@bbjrf274 <button className="cpbtn" onClick={() => copyText('@bbjrf274','Bre-B').then(()=>alert('Copiado ✓'))}>Copiar</button></span></div>
          </div>
          <div style={{ fontSize:11,color:'var(--text3)',marginTop:5,textAlign:'center' }}>⚠️ Realiza tus pagos únicamente a esta llave oficial y verifica el nombre del titular antes de transferir.</div>
        </div>
      </div>
    </div>
  )
}
