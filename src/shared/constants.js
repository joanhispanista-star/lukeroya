export const AK = 'lukero_users'
export const CK = 'lukero_sol'

export const PTS_NIVEL = 2000
export const PTS_PUNTUAL = 300
export const PTS_ANTICIPADO = 600
export const PTS_PRORROGA = 500

// ── PRECIO LEGAL (siempre bajo el techo de usura) ─────────────────────
// TECHO_EA = tope de usura E.A. (Tasa Efectiva Anual) de referencia, régimen
// de consumo. CAMBIA CADA MES: reconfírmalo con tu abogado / la SFC y
// actualízalo aquí. Jul 2026 ≈ 28,79% E.A. El código nunca cobra por encima
// de este techo (ver eaNivel() en utils.js).
export const TECHO_EA = 0.2879
export const PLAZO_DIAS = 30      // plazo base del crédito (días)
export const PRORROGA_DIAS = 15   // días que agrega cada prórroga

// `ea` = Tasa Efectiva Anual de cada nivel (mejor nivel → tasa más baja).
// Todas quedan por debajo de TECHO_EA. Con 2 codeudores (garantía) baja aún más.
export const NV = [
  { n:1,  nom:'Novato',      ea:.26, req:3,  pr:false, grace:true,  sec:false, creditoB:false, caps:[{m:100000,p:0},{m:200000,p:500}] },
  { n:2,  nom:'Bronce I',    ea:.26, req:3,  pr:true,  grace:false, sec:false, creditoB:false, caps:[{m:250000,p:0},{m:300000,p:500}] },
  { n:3,  nom:'Bronce II',   ea:.25, req:3,  pr:true,  grace:false, sec:false, creditoB:false, caps:[{m:350000,p:0},{m:400000,p:500}] },
  { n:4,  nom:'Plata I',     ea:.25, req:4,  pr:true,  grace:false, sec:false, creditoB:false, caps:[{m:450000,p:0},{m:500000,p:500}] },
  { n:5,  nom:'Plata II',    ea:.24, req:4,  pr:true,  grace:false, sec:false, creditoB:true,  caps:[{m:550000,p:0},{m:600000,p:500},{m:700000,p:1000}] },
  { n:6,  nom:'Oro I',       ea:.24, req:4,  pr:true,  grace:false, sec:false, creditoB:true,  caps:[{m:750000,p:0},{m:850000,p:500},{m:900000,p:1000}] },
  { n:7,  nom:'Oro II',      ea:.23, req:5,  pr:true,  grace:false, sec:false, creditoB:true,  caps:[{m:950000,p:0},{m:1050000,p:500},{m:1200000,p:1000}] },
  { n:8,  nom:'Diamante I',  ea:.23, req:5,  pr:true,  grace:false, sec:false, creditoB:true,  caps:[{m:1250000,p:0},{m:1350000,p:500},{m:1500000,p:1000}] },
  { n:9,  nom:'Diamante II', ea:.22, req:5,  pr:true,  grace:false, sec:false, creditoB:true,  caps:[{m:1550000,p:0},{m:1700000,p:500},{m:2000000,p:1000}] },
  { n:10, nom:'Elite',       ea:.22, req:5,  pr:true,  grace:false, sec:false, creditoB:true,  caps:[{m:2050000,p:0},{m:2250000,p:500},{m:2500000,p:1000}] },
  { n:11, nom:'Elite II',    ea:.21, req:6,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:2550000,p:0},{m:2800000,p:500},{m:3000000,p:1000}] },
  { n:12, nom:'Elite III',   ea:.21, req:6,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:3050000,p:0},{m:3300000,p:500},{m:3500000,p:1000}] },
  { n:13, nom:'Platino I',   ea:.20, req:6,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:3550000,p:0},{m:3800000,p:500},{m:4000000,p:1000}] },
  { n:14, nom:'Platino II',  ea:.20, req:6,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:4050000,p:0},{m:4500000,p:500},{m:5000000,p:1000}] },
  { n:15, nom:'Platino III', ea:.19, req:6,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:5050000,p:0},{m:5500000,p:500},{m:6000000,p:1000}] },
  { n:16, nom:'Titan I',     ea:.19, req:8,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:6050000,p:0},{m:6500000,p:500},{m:7000000,p:1000}] },
  { n:17, nom:'Titan II',    ea:.18, req:8,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:7050000,p:0},{m:7500000,p:500},{m:8000000,p:1000}] },
  { n:18, nom:'Titan III',   ea:.18, req:8,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:8050000,p:0},{m:8300000,p:500},{m:8500000,p:1000}] },
  { n:19, nom:'Legendario',  ea:.17, req:8,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:8550000,p:0},{m:8800000,p:500},{m:9000000,p:1000}] },
  { n:20, nom:'BLACK',       ea:.16, req:99, pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:9050000,p:0},{m:9500000,p:500},{m:10000000,p:1000}] },
]

export const CRM_CREDS = {
  owner:  { user:'owner',   pass:'owner123',  name:'Owner',        rol:'owner'  },
  admin:  { user:'admin',   pass:'admin123',  name:'Administrador',rol:'admin'  },
  asesor: { user:'asesor1', pass:'asesor123', name:'Asesor 1',     rol:'asesor' },
  ventas: { user:'ventas1', pass:'ventas123', name:'Ventas 1',     rol:'ventas' },
}

export const DEMO_USER = {
  cedula:'1234567890', pass:'demo123', nombre:'Demo Usuario',
  tel:'3001234567', ciudad:'Bogotá', nivel:3, puntos:1500, creds:2,
  historial:[], creditoActivo:null, fechaReg:'01/01/2025',
  sc:{}, email:'demo@lukero.co', kycDone:true,
}

export const TYC_HTML = `<h3>1. PARTES</h3><p>Contrato de mutuo entre <strong>NEXECO SAS</strong> ("Lukero") y el <strong>USUARIO</strong>, persona natural mayor de 18 años.</p><h3>2. NATURALEZA DEL SERVICIO</h3><p>Lukero es una plataforma de tecnología financiera que origina crédito de consumo con recursos propios. No es entidad vigilada por la Superintendencia Financiera; opera bajo el Código de Comercio, la Ley 1480 de 2011 y la vigilancia de la Superintendencia de Industria y Comercio.</p><h3>3. CONDICIONES DEL CRÉDITO</h3><p>3.1. Plazo base: <strong>30 días calendario</strong> (prorrogable +15 días desde N2, máximo 2 prórrogas).<br/>3.2. El único costo es el <strong>interés corriente</strong>, calculado a una <strong>Tasa Efectiva Anual (E.A.)</strong> que <strong>nunca supera el tope de usura</strong> certificado mensualmente por la Superintendencia Financiera. No se cobran pólizas, cuotas de administración ni cargos por tecnología.<br/>3.3. Antes de aceptar, la aplicación te muestra el <strong>valor exacto en pesos</strong> del interés, el <strong>total a pagar</strong> y la <strong>Tasa Efectiva Anual</strong> de tu crédito (Ley 1480 de 2011, deber de información al consumidor).<br/>3.4. <strong>Mora:</strong> ante el no pago se cobra interés moratorio a la <strong>máxima tasa legal vigente</strong> (tasa de usura de la modalidad), nunca por encima de ese tope.</p><h3>4. PAGO ANTICIPADO</h3><p>Puedes pagar en cualquier momento sin penalidad. El interés se <strong>recalcula por los días efectivamente utilizados</strong>: a menos días, menos interés.</p><h3>5. TRATAMIENTO DE DATOS — LEY 1581 DE 2012 (HABEAS DATA)</h3><p>Responsable: <strong>NEXECO SAS</strong> (privacidad@lukero.co). Al aceptar, autorizas de forma previa, expresa e informada el tratamiento de tus datos personales para: (i) verificar tu identidad, (ii) evaluar, otorgar y gestionar el crédito, y (iii) registrar tu comportamiento de pago. Como titular puedes <strong>conocer, actualizar, rectificar y suprimir</strong> tus datos y <strong>revocar</strong> esta autorización escribiendo a privacidad@lukero.co. La política de tratamiento completa está disponible en ese canal.</p><h3>6. LEY APLICABLE</h3><p>Leyes de la República de Colombia. Controversias: jueces de Bogotá D.C.</p><p style="margin-top:12px;font-size:11px;color:#5a5a70;">Versión 2.0 · Julio 2026 · NEXECO SAS · Bogotá D.C.</p>`
