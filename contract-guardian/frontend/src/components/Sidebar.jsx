import { NavLink, useLocation } from 'react-router-dom'

const items = [
  { label: 'Dashboard', to: '/' },
  { label: 'Contracts', to: '/contracts' },
  { label: 'Upload Contract', to: '/contracts/upload' },
  { label: 'Calendar', to: '/calendar' },
  { label: 'Notifications', to: '/notifications' },
  { label: 'Settings', to: '/settings' },
  { label: 'Admin', to: '/admin' },
]

import { useUI } from '../contexts/UIContext'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar({ isOpen }) {
  const ui = useUI()
  const { user } = useAuth()
  const location = useLocation()
  const open = typeof isOpen === 'boolean' ? isOpen : ui?.isSidebarOpen
  const visibleItems = items.filter((item) => (item.to !== '/admin' ? true : user?.role === 'admin'))

  const isItemActive = (item) => {
    const pathname = location.pathname

    if (item.to === '/') {
      return pathname === '/'
    }

    if (item.to === '/contracts') {
      return pathname === '/contracts' || (pathname.startsWith('/contracts/') && pathname !== '/contracts/upload')
    }

    return pathname === item.to || pathname.startsWith(`${item.to}/`)
  }

  return (
    <aside className={`fixed top-16 left-0 z-20 h-[calc(100vh-4rem)] w-72 overflow-auto border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0`}>
      <div className="mb-8 px-2">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Workspace</p>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">ContractGuardian</p>
          <p className="mt-1 text-xs text-slate-500">Manage all agreements from one secure dashboard.</p>
        </div>
      </div>
      <nav className="space-y-2 px-2">
        {visibleItems.map((item) => {
          const active = isItemActive(item)

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`block rounded-3xl px-4 py-3 text-sm font-medium transition ${
                active ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
