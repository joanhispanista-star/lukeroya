import { useState } from 'react'
import useClientStore from '../store'
import { NV, MESES_OPCIONES } from '../../shared/constants'
import { fmtCOP, capsDisp, calcDesglose } from '../../shared/utils'
import './Home.css'

export default function Home() {
  const { user, nav } = useClientStore()
  const nivel = NV[(user?.nivel || 1) - 1]
  const [selNiv, setSelNiv] = useState(user?.nivel || 1)
  const [selCap, setSelCap] = useState(NV[(user?.nivel||1)-1].caps[0].m)
  const [conCodeudores, setConCodeudores] = useState(false)
  const [selMeses, setSelMeses] = useState(MESES_OPCIONES[0])

  const nv = NV[selNiv - 1]
  const puntos = user?.puntos || 0
  const caps = capsDisp(nv, puntos)
  const d = calcDesglose(selCap, selNiv, { conCodeudores, meses: selMeses })

  return (
    <div className="screen-inner">
      <div className="hero">
        <span className="mascot">🤖</span>
        <h1 className="hero-title">HOLA{user ? `, ${user.nombre.split(' ')[0].toUpperCase()}!` : '!'}</h1>
        <div className="hero-sub">Tu crédito express · sin filas · sin bancos</div>
        <div className="hbadges">
          <span className="hb hb-g">⚡ Hasta $10.000.000</span>
          <span className="hb hb-gr">✓ 100% Digital</span>
          <span className="hb hb-b">🔒 Seguro</span>
        </div>
      </div>

      <div className="pw">
        {/* Crédito activo */}
        {user?.creditoActivo && user.creditoActivo.estado !== 'pagado' && (
          <div className="card ca-alert" onClick={() => nav('cred')}>
            <div className="ca-row">
              <div><div className="ca-lbl">Crédito activo</div><div className="ca-val">{fmtCOP(user.creditoActivo.totalPagar)}</div></div>
              <div><div className="ca-lbl">Vence</div><div className="ca-val" style={{ color:'var(--orange)' }}>{user.creditoActivo.fechaVence}</div></div>
            </div>
            <div className="ca-link">Ver detalles →</div>
          </div>
        )}

        {/* Simulador */}
        <div className="simw">
          <div className="ctitle">⚡ Simula tu crédito</div>
          <div className="slbl">Nivel</div>
          <div className="lvsc">
            {NV.slice(0, user?.nivel && user.nivel >= 10 ? 20 : 10).map(n => (
              <button key={n.n}
                className={`lvbtn${selNiv === n.n ? ' active' : ''}${n.n > (user?.nivel||1) ? ' locked' : ''}`}
                onClick={() => { setSelNiv(n.n); setSelCap(n.caps[0].m) }}
              >N{n.n}</button>
            ))}
          </div>
          {nv.grace && <div className="grace">🎁 ¡1 día de gracia gratis para nuevos!</div>}
          <div className="slbl" style={{ marginTop:9 }}>Monto</div>
          <div className="capg">
            {caps.map(c => (
              <button key={c.m} className={`capbtn${selCap === c.m ? ' active' : ''}`}
                onClick={() => setSelCap(c.m)}>{fmtCOP(c.m)}</button>
            ))}
          </div>
          <div className="slbl" style={{ marginTop:9 }}>Plazo</div>
          <div className="capg">
            {MESES_OPCIONES.map(m => (
              <button key={m} className={`capbtn${selMeses === m ? ' active' : ''}`}
                onClick={() => setSelMeses(m)}>{m} meses</button>
            ))}
          </div>
          <div className="res-box">
            <div className="res-row"><span>Capital</span><span>{fmtCOP(selCap)}</span></div>
            <div className="res-row total"><span>Cuota mensual</span><span>{fmtCOP(d.cuota)}</span></div>
            <div className="res-row"><span>Nº de cuotas</span><span>{d.nCuotas} meses</span></div>
            <div className="res-row"><span>Total a pagar</span><span>{fmtCOP(d.total)}</span></div>
            <div className="res-row"><span>Interés total</span><span>+{fmtCOP(d.interes)}</span></div>
            <div className="res-row"><span>Tasa E.A.</span><span>{(d.ea * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 })}%</span></div>
          </div>
          <label className="codeu">
            <input type="checkbox" checked={conCodeudores} onChange={e => setConCodeudores(e.target.checked)} />
            <span>Tengo <strong>2 codeudores</strong> con documentos y contrato firmado — <em>mejor tasa</em></span>
          </label>
          {conCodeudores && <div className="codeu-note">📎 Un asesor validará los documentos de tus 2 codeudores antes de aprobar.</div>}
          <div className="prr-note">💡 Pagas en {selMeses} cuotas mensuales iguales.</div>
          <button className="btna" onClick={() => nav('sol')}>SOLICITAR AHORA ›</button>
        </div>

        {/* Pasos */}
        <div className="steps-grid">
          {[['📱','Solicita','Llena el formulario'],['⚡','Aprobamos','En minutos'],['💰','Recibe','Nequi o cuenta']].map(([ico,tit,sub]) => (
            <div key={tit} className="card step-card">
              <div style={{ fontSize:20, marginBottom:3 }}>{ico}</div>
              <div style={{ fontSize:11, fontWeight:600, marginBottom:1 }}>{tit}</div>
              <div style={{ fontSize:10, color:'var(--text2)' }}>{sub}</div>
            </div>
          ))}
        </div>

        <div className="mstrip">
          <div className="mst">¿Por qué Lukero?</div>
          <div className="msx">El 60% de los colombianos no accede a crédito bancario. Lukero nació para cambiar eso — sin papeleo, sin filas, sin historial previo requerido.</div>
          <div className="mpil">
            {[['⚡','Aprobación en minutos'],['📈','Mejoras con cada pago'],['🔒','Costos 100% transparentes']].map(([i,t]) => (
              <div key={t} className="mp"><div className="mi">{i}</div><div className="mt">{t}</div></div>
            ))}
          </div>
        </div>

        {/* Tesoro / diseño de lujo */}
        <div className="lux">
          <div className="lux-scan" />
          <div className="lux-title">✦ Mientras más subes, más desbloqueas ✦</div>
          <div className="lux-treasure">
            <span className="tz gem" />
            <span className="tz coin" />
            <span className="tz bar" />
            <span className="tz coin" />
            <span className="tz gem" />
          </div>
          <div className="lux-sub">Oro, plata y diamantes — cada nivel te da <strong>mejores condiciones</strong>.</div>
          <button className="btna lux-btn" onClick={() => nav('niv')}>VER MIS NIVELES ›</button>
        </div>
      </div>
    </div>
  )
}
