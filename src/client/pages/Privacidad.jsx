import { TYC_VERSION } from '../../shared/constants'

// Página PÚBLICA (sin login) — Google Play exige una URL de política de privacidad
// accesible por cualquiera. Cumple Ley 1581 de 2012 y Decreto 1377 de 2013.
// ⚠️ Borrador sólido: debe revisarlo un abogado antes de operar con clientes reales.
const S = {
  wrap: { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '28px 18px 64px' },
  inner: { maxWidth: 760, margin: '0 auto' },
  logo: { fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 30, color: 'var(--gold)', letterSpacing: 1 },
  sub: { color: 'var(--text2)', fontSize: 13, marginTop: 2 },
  h1: { fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, margin: '26px 0 6px' },
  h2: { fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, margin: '24px 0 6px', color: 'var(--gold)' },
  p: { fontSize: 14, lineHeight: 1.75, color: 'var(--text2)', margin: '0 0 10px' },
  li: { fontSize: 14, lineHeight: 1.75, color: 'var(--text2)', margin: '0 0 6px' },
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 10 },
  foot: { marginTop: 30, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' },
  a: { color: 'var(--gold)' },
}

export default function Privacidad() {
  return (
    <div style={S.wrap}>
      <div style={S.inner}>
        <div style={S.logo}>LUKERO</div>
        <div style={S.sub}>NEXECO SAS · Bogotá D.C., Colombia</div>

        <h1 style={S.h1}>Política de Tratamiento de Datos Personales</h1>
        <p style={S.p}>
          En cumplimiento de la <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong>, NEXECO SAS
          informa cómo recolecta, usa, almacena y protege tus datos personales.
        </p>

        <h2 style={S.h2}>1. Responsable del tratamiento</h2>
        <div style={S.card}>
          <p style={{ ...S.p, margin: 0 }}>
            <strong style={{ color: 'var(--text)' }}>NEXECO SAS</strong><br />
            Domicilio: Bogotá D.C., Colombia<br />
            Correo para datos personales: <a style={S.a} href="mailto:privacidad@lukero.co">privacidad@lukero.co</a>
          </p>
        </div>

        <h2 style={S.h2}>2. Datos que recolectamos</h2>
        <ul>
          <li style={S.li}><strong>Identificación:</strong> nombre, número de cédula, teléfono, correo electrónico y ciudad.</li>
          <li style={S.li}><strong>Del crédito:</strong> monto solicitado, plazo, cuotas, estado y comportamiento de pago.</li>
          <li style={S.li}><strong>De la autorización:</strong> fecha y versión de los términos que aceptaste.</li>
        </ul>
        <p style={S.p}>
          No recolectamos tus contactos, tus fotos, tu ubicación precisa ni los archivos de tu dispositivo.
        </p>

        <h2 style={S.h2}>3. Finalidades</h2>
        <ul>
          <li style={S.li}>Verificar tu identidad.</li>
          <li style={S.li}>Evaluar, otorgar y gestionar tu crédito.</li>
          <li style={S.li}>Gestionar el pago y el recaudo de las cuotas.</li>
          <li style={S.li}>Registrar tu comportamiento de pago para construir tu historial y tu nivel dentro de Lukero.</li>
          <li style={S.li}>Contactarte por asuntos relacionados con tu crédito.</li>
          <li style={S.li}>Cumplir obligaciones legales y contables.</li>
        </ul>

        <h2 style={S.h2}>4. Autorización</h2>
        <p style={S.p}>
          Al registrarte y aceptar los Términos y Condiciones otorgas tu autorización <strong>previa, expresa e
          informada</strong> para el tratamiento de tus datos con las finalidades anteriores. Guardamos la fecha y la
          versión aceptada como prueba de tu autorización.
        </p>

        <h2 style={S.h2}>5. Transmisión a terceros</h2>
        <p style={S.p}>
          Con tu autorización, tu <strong>comportamiento de pago</strong> (pago puntual o mora) puede compartirse con
          <strong> Plaza</strong>, plataforma de reputación de NEXECO SAS, con la finalidad de construir tu reputación
          de crédito. No vendemos tus datos personales a terceros.
        </p>

        <h2 style={S.h2}>6. Tus derechos como titular</h2>
        <ul>
          <li style={S.li}><strong>Conocer, actualizar y rectificar</strong> tus datos.</li>
          <li style={S.li}><strong>Solicitar prueba</strong> de la autorización que otorgaste.</li>
          <li style={S.li}>Ser <strong>informado</strong> sobre el uso que damos a tus datos.</li>
          <li style={S.li}><strong>Revocar</strong> la autorización y/o solicitar la <strong>supresión</strong> de tus datos, cuando no exista un deber legal o contractual que lo impida.</li>
          <li style={S.li}>Presentar quejas ante la <strong>Superintendencia de Industria y Comercio (SIC)</strong>.</li>
        </ul>

        <h2 style={S.h2}>7. Consultas y reclamos</h2>
        <p style={S.p}>
          Escríbenos a <a style={S.a} href="mailto:privacidad@lukero.co">privacidad@lukero.co</a> indicando tu nombre,
          cédula y la solicitud. Las <strong>consultas</strong> se atienden en un máximo de <strong>10 días hábiles</strong> y
          los <strong>reclamos</strong> en <strong>15 días hábiles</strong> (prorrogables por 8 días hábiles más), conforme a la Ley 1581.
        </p>

        <h2 style={S.h2}>8. Seguridad</h2>
        <p style={S.p}>
          Aplicamos medidas técnicas y administrativas para proteger tus datos: las contraseñas se guardan cifradas
          (nunca en texto plano), la conexión viaja por HTTPS y el acceso a la información está restringido al personal
          autorizado.
        </p>

        <h2 style={S.h2}>9. Vigencia</h2>
        <p style={S.p}>
          Tus datos se conservan mientras exista la relación contractual y durante los plazos exigidos por la ley
          (obligaciones contables, tributarias y comerciales). Cumplidos esos plazos, se suprimen.
        </p>

        <div style={S.foot}>
          Versión {TYC_VERSION} · Julio 2026 · NEXECO SAS · Bogotá D.C. — <a style={S.a} href="/">Volver a Lukero</a>
        </div>
      </div>
    </div>
  )
}
