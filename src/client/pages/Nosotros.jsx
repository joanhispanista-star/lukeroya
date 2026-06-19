import { copyText } from '../../shared/utils'
import './Nosotros.css'

export default function Nosotros() {
  return (
    <div className="screen-inner">
      <nav className="topnav"><div className="nav-logo">Lukero</div></nav>
      <div className="pw">
        <div className="mhero"><div className="mhico">🤖</div><div className="mhtit">Inclusión financiera para todos</div><div className="mhtx">En Lukero creemos que el acceso al crédito no debería depender de cuánto tiempo llevas en el sistema bancario.</div></div>
        <div className="sgrid">
          {[['100%','Digital · sin filas'],['8','días de plazo base'],['20','niveles de fidelidad'],['$10M','máximo disponible']].map(([n,l]) => (
            <div key={l} className="sbox"><div className="sbn">{n}</div><div className="sbl">{l}</div></div>
          ))}
        </div>
        <div className="card"><div className="ctitle">🎯 Nuestra misión</div><p style={{ fontSize:13,color:'var(--text2)',lineHeight:1.7 }}>Democratizar el acceso al crédito en Colombia. Millones no tienen historial crediticio — Lukero nació para ellos.</p></div>
        <div className="card"><div className="ctitle">🏢 NEXECO SAS</div><p style={{ fontSize:13,color:'var(--text2)',lineHeight:1.7 }}>Empresa de tecnología financiera colombiana, domiciliada en Bogotá D.C. Operamos con recursos propios bajo el marco legal del Código de Comercio.</p></div>
        <div className="card"><div className="ctitle">🔒 Cuentas oficiales de pago</div>
          {[['🏦','Bancolombia','Cuenta Ahorros · NEXECO SAS','123-456789-00'],['🔴','Nequi','Billetera digital','300 000 0000']].map(([ico,nom,sub,num]) => (
            <div key={nom} className="bkc">
              <div className="bkh"><div className="bkl">{ico}</div><div><div className="bkn">{nom}</div><div className="bkt">{sub}</div></div></div>
              <div className="bkr"><span className="bkrl">No. / Número</span><span className="bkrv">{num} <button className="cpbtn" onClick={() => copyText(num.replace(/ /g,''),nom).then(()=>alert('Copiado ✓'))}>Copiar</button></span></div>
            </div>
          ))}
          <div style={{ fontSize:11,color:'var(--text3)',marginTop:5,textAlign:'center' }}>⚠️ Solo pagos a estas cuentas oficiales.</div>
        </div>
      </div>
    </div>
  )
}
