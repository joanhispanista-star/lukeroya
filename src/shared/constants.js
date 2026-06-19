export const AK = 'lukero_users'
export const CK = 'lukero_sol'

export const PTS_NIVEL = 2000
export const PTS_PUNTUAL = 300
export const PTS_ANTICIPADO = 600
export const PTS_PRORROGA = 500

export const NV = [
  { n:1,  nom:'Novato',      tasa:.30, req:3,  pr:false, grace:true,  sec:false, creditoB:false, caps:[{m:100000,p:0},{m:200000,p:500}] },
  { n:2,  nom:'Bronce I',    tasa:.30, req:3,  pr:true,  grace:false, sec:false, creditoB:false, caps:[{m:250000,p:0},{m:300000,p:500}] },
  { n:3,  nom:'Bronce II',   tasa:.28, req:3,  pr:true,  grace:false, sec:false, creditoB:false, caps:[{m:350000,p:0},{m:400000,p:500}] },
  { n:4,  nom:'Plata I',     tasa:.28, req:4,  pr:true,  grace:false, sec:false, creditoB:false, caps:[{m:450000,p:0},{m:500000,p:500}] },
  { n:5,  nom:'Plata II',    tasa:.26, req:4,  pr:true,  grace:false, sec:false, creditoB:true,  caps:[{m:550000,p:0},{m:600000,p:500},{m:700000,p:1000}] },
  { n:6,  nom:'Oro I',       tasa:.26, req:4,  pr:true,  grace:false, sec:false, creditoB:true,  caps:[{m:750000,p:0},{m:850000,p:500},{m:900000,p:1000}] },
  { n:7,  nom:'Oro II',      tasa:.24, req:5,  pr:true,  grace:false, sec:false, creditoB:true,  caps:[{m:950000,p:0},{m:1050000,p:500},{m:1200000,p:1000}] },
  { n:8,  nom:'Diamante I',  tasa:.24, req:5,  pr:true,  grace:false, sec:false, creditoB:true,  caps:[{m:1250000,p:0},{m:1350000,p:500},{m:1500000,p:1000}] },
  { n:9,  nom:'Diamante II', tasa:.22, req:5,  pr:true,  grace:false, sec:false, creditoB:true,  caps:[{m:1550000,p:0},{m:1700000,p:500},{m:2000000,p:1000}] },
  { n:10, nom:'Elite',       tasa:.22, req:5,  pr:true,  grace:false, sec:false, creditoB:true,  caps:[{m:2050000,p:0},{m:2250000,p:500},{m:2500000,p:1000}] },
  { n:11, nom:'Elite II',    tasa:.20, req:6,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:2550000,p:0},{m:2800000,p:500},{m:3000000,p:1000}] },
  { n:12, nom:'Elite III',   tasa:.20, req:6,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:3050000,p:0},{m:3300000,p:500},{m:3500000,p:1000}] },
  { n:13, nom:'Platino I',   tasa:.18, req:6,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:3550000,p:0},{m:3800000,p:500},{m:4000000,p:1000}] },
  { n:14, nom:'Platino II',  tasa:.18, req:6,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:4050000,p:0},{m:4500000,p:500},{m:5000000,p:1000}] },
  { n:15, nom:'Platino III', tasa:.16, req:6,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:5050000,p:0},{m:5500000,p:500},{m:6000000,p:1000}] },
  { n:16, nom:'Titan I',     tasa:.16, req:8,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:6050000,p:0},{m:6500000,p:500},{m:7000000,p:1000}] },
  { n:17, nom:'Titan II',    tasa:.14, req:8,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:7050000,p:0},{m:7500000,p:500},{m:8000000,p:1000}] },
  { n:18, nom:'Titan III',   tasa:.14, req:8,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:8050000,p:0},{m:8300000,p:500},{m:8500000,p:1000}] },
  { n:19, nom:'Legendario',  tasa:.12, req:8,  pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:8550000,p:0},{m:8800000,p:500},{m:9000000,p:1000}] },
  { n:20, nom:'BLACK',       tasa:.12, req:99, pr:true,  grace:false, sec:true,  creditoB:true,  caps:[{m:9050000,p:0},{m:9500000,p:500},{m:10000000,p:1000}] },
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

export const TYC_HTML = `<h3>1. PARTES</h3><p>Contrato entre <strong>NEXECO SAS</strong> ("Lukero") y el <strong>USUARIO</strong>, persona natural mayor de 18 años.</p><h3>2. NATURALEZA DEL SERVICIO</h3><p>Lukero es una plataforma de tecnología financiera de originación de crédito con recursos propios. No es entidad vigilada por la SFC. Opera bajo el Código de Comercio y la Ley 1480 de 2011.</p><h3>3. CONDICIONES DEL CRÉDITO</h3><p>3.1. Plazo base: <strong>8 días calendario</strong>.<br/>3.2. Costo total: <strong>30%</strong> sobre el capital.<br/>3.3. <strong>Prórroga:</strong> +3 días, disponible desde N2, máximo 2 por crédito.<br/>3.4. <strong>Mora:</strong> 1% diario sobre el capital.</p><h3>4. DESCUENTOS POR PAGO ANTICIPADO</h3><p>4.1. 3+ días antes: exención de póliza e intereses.<br/>4.2. 2 días antes: exención de póliza.<br/>4.3. 1 día antes: 50% desc. gastos tecnológicos.<br/>4.4. Día de pago antes 12pm: 40% desc. gastos tecnológicos.</p><h3>5. DATOS PERSONALES — LEY 1581 DE 2012</h3><p>NEXECO SAS trata datos para verificación de identidad y gestión del crédito. Correo: privacidad@lukero.co.</p><h3>6. LEY APLICABLE</h3><p>Leyes de Colombia. Controversias: jueces de Bogotá D.C.</p><p style="margin-top:12px;font-size:11px;color:#5a5a70;">Versión 1.0 · Junio 2026 · NEXECO SAS · Bogotá D.C.</p>`
