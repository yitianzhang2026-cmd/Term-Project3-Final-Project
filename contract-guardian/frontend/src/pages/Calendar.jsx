import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import { contractApi } from '../api/api'

export default function Calendar() {
  
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contractApi.list().then((res) => setContracts(res.data.contracts)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="md:grid md:grid-cols-[18rem_1fr]">
        <Sidebar />
        <main className="min-h-screen flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
            <h1 className="text-3xl font-semibold text-slate-900">Renewal Calendar</h1>
            <p className="mt-2 text-slate-500">Track contract deadlines and upcoming renewals in one place.</p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {contracts.map((contract) => (
                <div key={contract.id} className="rounded-3xl border border-slate-200 p-5">
                  <h2 className="font-semibold text-slate-900">{contract.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">{contract.vendor}</p>
                  <p className="mt-4 text-sm text-slate-600">Next deadline: {contract.deadlines?.[0]?.due_date || 'Not available'}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{contract.deadlines?.[0]?.title || 'Review cycle'}</p>
                </div>
              ))}
            </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
