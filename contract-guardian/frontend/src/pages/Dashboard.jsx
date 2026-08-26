import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { contractApi, notificationApi, adminApi } from '../api/api'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  
  const [stats, setStats] = useState(null)
  const [contracts, setContracts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    Promise.all([contractApi.list(), notificationApi.list(), adminApi.stats()])
      .then(([contractsRes, notificationsRes, statsRes]) => {
        setContracts(contractsRes.data.contracts.slice(0, 4))
        setNotifications(notificationsRes.data.notifications.slice(0, 4))
        setStats(statsRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="md:grid md:grid-cols-[18rem_1fr]">
        <Sidebar />
        <main className="min-h-screen flex-1 p-6">
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="grid gap-6 xl:grid-cols-4 lg:grid-cols-2">
              <DashboardCard title="Users" value={stats?.total_users || 0} subtitle="Active platform users" icon="👥" />
              <DashboardCard title="Contracts" value={stats?.total_contracts || 0} subtitle="Total tracked contracts" icon="📄" />
              <DashboardCard title="High Risk" value={stats?.high_risk_contracts || 0} subtitle="Risky contract count" icon="⚠️" />
              <DashboardCard title="Renewals" value={stats?.upcoming_renewals || 0} subtitle="Renewals upcoming" icon="⏳" />
            </div>

            <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-slate-900">Welcome back, {user?.name}</h2>
                <p className="mt-3 text-slate-500">Track deadlines, review risk summaries, and keep every contract under control.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-slate-900">Latest contracts</h2>
                <ul className="mt-4 space-y-3">
                  {contracts.map((item) => (
                    <li key={item.id} className="rounded-3xl border border-slate-200 p-4">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.vendor}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-slate-900">Recent notifications</h2>
                <ul className="mt-4 space-y-3">
                  {notifications.map((note) => (
                    <li key={note.id} className="rounded-3xl border border-slate-200 p-4">
                      <p className="text-sm text-slate-700">{note.message}</p>
                      <p className="mt-1 text-xs text-slate-400">{new Date(note.created_at).toDateString()}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
