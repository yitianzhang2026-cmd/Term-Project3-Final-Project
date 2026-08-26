import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import { contractApi } from '../api/api'

export default function Contracts() {
  
  const [contracts, setContracts] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contractApi.list().then((res) => setContracts(res.data.contracts)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    const response = await contractApi.list({ search: query })
    setContracts(response.data.contracts)
    setLoading(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="md:grid md:grid-cols-[18rem_1fr]">
        <Sidebar />
        <main className="min-h-screen flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">Contracts</h1>
                <p className="text-slate-500">Browse, filter, and manage contract details with a clear agenda.</p>
              </div>
              <Link
                to="/contracts/upload"
                className="inline-flex items-center rounded-3xl bg-brand-700 px-5 py-3 text-white transition hover:bg-brand-800"
              >
                Upload Contract
              </Link>
            </div>
          </div>

          <form className="mb-6 grid gap-4 sm:grid-cols-[1fr_auto]" onSubmit={handleSearch}>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">🔎</span>
              <input
                type="search"
                placeholder="Search contracts by name, vendor, or category"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12"
              />
            </div>
            <button className="rounded-3xl bg-brand-700 px-6 py-3 text-white transition hover:bg-brand-800">Search</button>
          </form>

          <div className="grid gap-6 lg:grid-cols-2">
            {contracts.map((contract) => (
              <div key={contract.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{contract.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{contract.vendor}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{contract.risk_level}</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{contract.ai_summary || 'No summary available.'}</p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span>Category: {contract.category}</span>
                  <span>Status: {contract.status}</span>
                </div>
                <Link
                  to={`/contracts/${contract.id}`}
                  className="mt-6 inline-flex rounded-3xl bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
                >
                  View details
                </Link>
              </div>
            ))}
          </div>
          </div>
        </main>
      </div>
    </div>
  )
}
