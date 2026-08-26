import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { adminApi } from '../api/api'

export default function AdminDashboard() {
  
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.stats().then((res) => setStats(res.data)).catch(console.error).finally(() => setLoading(false))
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
              <DashboardCard title="Total Users" value={stats.total_users} icon="👤" />
              <DashboardCard title="Contracts" value={stats.total_contracts} icon="📁" />
              <DashboardCard title="High Risk" value={stats.high_risk_contracts} icon="🔥" />
              <DashboardCard title="Renewals" value={stats.upcoming_renewals} icon="📅" />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <h2 className="text-xl font-semibold text-slate-900">Contracts by Category</h2>
                <ul className="mt-4 space-y-3">
                  {stats.contracts_by_category.map((item) => (
                    <li key={item.category} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                      <span>{item.category}</span>
                      <span className="font-semibold text-slate-900">{item.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <h2 className="text-xl font-semibold text-slate-900">Risk Distribution</h2>
                <ul className="mt-4 space-y-3">
                  {stats.risk_distribution.map((item) => (
                    <li key={item.risk_level} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                      <span>{item.risk_level}</span>
                      <span className="font-semibold text-slate-900">{item.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
              <ul className="mt-4 space-y-4">
                {stats.recent_activity.map((item) => (
                  <li key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{item.action}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.details}</p>
                    <p className="mt-2 text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
