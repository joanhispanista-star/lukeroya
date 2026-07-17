import { useEffect, useState } from 'react'
import './InstalarBanner.css'

// Banner "Instala Lukero": la mayoría de la gente no conoce el
// "Agregar a pantalla de inicio", así que se lo ofrecemos directo.
//  • Android/Chrome: botón que dispara el aviso nativo de instalación.
//  • iPhone/iPad: Safari no tiene ese aviso — mostramos la instrucción.
//  • No aparece si ya está instalada o si el cliente lo cerró antes.
const K = 'lukero_install_dismiss'

export default function InstalarBanner() {
  const [deferred, setDeferred] = useState(null)
  const [ios, setIos] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const yaInstalada = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    if (yaInstalada || localStorage.getItem(K)) return

    const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    if (esIOS) { setIos(true); setVisible(true); return }

    const onPrompt = (e) => { e.preventDefault(); setDeferred(e); setVisible(true) }
    const onInstalled = () => setVisible(false)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!visible) return null

  const cerrar = () => { try { localStorage.setItem(K, '1') } catch {} ; setVisible(false) }
  const instalar = async () => {
    if (!deferred) return
    deferred.prompt()
    const r = await deferred.userChoice.catch(() => null)
    setDeferred(null)
    if (r && r.outcome === 'accepted') setVisible(false)
  }

  return (
    <div className="inst-banner">
      <span className="inst-txt">
        {ios
          ? <>📲 Instala Lukero: toca <strong>Compartir</strong> y luego <strong>"Agregar a pantalla de inicio"</strong></>
          : <>📲 Lleva Lukero en tu celular como una app</>}
      </span>
      {!ios && <button className="inst-btn" onClick={instalar}>Instalar</button>}
      <button className="inst-x" onClick={cerrar} aria-label="Cerrar">✕</button>
    </div>
  )
}
