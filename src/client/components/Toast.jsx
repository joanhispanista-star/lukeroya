import useClientStore from '../store'
import './Toast.css'

export default function Toast() {
  const toast = useClientStore(s => s.toast)
  if (!toast) return null
  return (
    <div className={`toast on${toast.type === 'err' ? ' err' : ''}`}>
      {toast.msg}
    </div>
  )
}
