import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUI } from '../contexts/UIContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { toggleSidebar } = useUI()

  const handleToggle = toggleSidebar

  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-6 backdrop-blur-xl shadow-soft">
      <div className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggle}
            aria-label="Toggle sidebar"
            className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
          >
            <span className="text-xl">☰</span>
          </button>

          <Link to="/" className="flex flex-col">
            <span className="text-xl font-semibold tracking-tight text-slate-900">ContractGuardian</span>
            <span className="text-xs text-slate-500">Secure contract intelligence</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">{user?.role || 'Guest'}</span>
          <button
            onClick={logout}
            className="rounded-3xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
