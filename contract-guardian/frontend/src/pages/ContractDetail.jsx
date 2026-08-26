import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import { contractApi } from '../api/api'

export default function ContractDetail() {
  
  const [contract, setContract] = useState(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const params = useParams()

  useEffect(() => {
    contractApi.get(params.id)
      .then((res) => setContract(res.data.contract))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!note) return
    try {
      await contractApi.addNote(params.id, note)
      const res = await contractApi.get(params.id)
      setContract(res.data.contract)
      setNote('')
    } catch (err) {
      console.error(err)
    }
  }

  const handleFileAction = async (mode) => {
    if (!contract?.file_path) return

    try {
      const response = mode === 'view' ? await contractApi.view(params.id) : await contractApi.download(params.id)
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      if (mode === 'view') {
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        const link = document.createElement('a')
        link.href = url
        link.download = `${contract.name || 'contract'}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 10000)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!contract) return <div className="p-10 text-center text-slate-600">Contract not found.</div>

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="md:grid md:grid-cols-[18rem_1fr]">
        <Sidebar />
        <main className="min-h-screen flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">{contract.name}</h1>
                <p className="mt-2 text-slate-500">{contract.vendor} • {contract.category}</p>
              </div>
              <div className="space-x-3">
                <Link
                  to="/contracts"
                  className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
                >
                  Back to contracts
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Status</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{contract.status}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Risk Score</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{contract.risk_score}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Renewal</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{contract.deadlines?.[0]?.due_date || 'TBD'}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-900">AI Summary</h2>
                <p className="mt-4 text-slate-600">{contract.ai_summary || 'No AI summary generated.'}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-900">Risk Details</h2>
                <p className="mt-4 text-slate-600">Severity: {contract.risk_level}</p>
                <div className="mt-4 space-y-3">
                  {contract.risks.map((risk) => (
                    <div key={risk.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                      <p className="font-semibold text-slate-900">{risk.risk_type}</p>
                      <p className="mt-1 text-sm text-slate-600">{risk.description}</p>
                      <span className="mt-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">{risk.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-900">Deadlines</h2>
                <ul className="mt-4 space-y-3">
                  {contract.deadlines.map((deadline) => (
                    <li key={deadline.id} className="rounded-2xl border border-slate-200 p-4">
                      <p className="font-semibold text-slate-900">{deadline.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{deadline.due_date}</p>
                      <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{deadline.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-900">Notes</h2>
                <form className="mt-4 space-y-4" onSubmit={handleAddNote}>
                  <textarea
                    rows="4"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add an internal note"
                    className="w-full"
                  />
                  <button className="rounded-2xl bg-brand-700 px-5 py-3 text-white transition hover:bg-brand-800">Add Note</button>
                </form>
                <ul className="mt-6 space-y-4">
                  {contract.notes.map((item) => (
                    <li key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-700">{item.content}</p>
                      <p className="mt-2 text-xs text-slate-400">{item.author} • {new Date(item.created_at).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-2xl bg-brand-700 px-5 py-3 text-white transition hover:bg-brand-800">Edit</button>
              <button className="rounded-2xl bg-slate-100 px-5 py-3 text-slate-700 transition hover:bg-slate-200">Delete</button>
              <button
                type="button"
                onClick={() => handleFileAction('view')}
                className="rounded-3xl bg-slate-100 px-5 py-3 text-slate-700 transition hover:bg-slate-200"
              >
                Open PDF
              </button>
              <button
                type="button"
                onClick={() => handleFileAction('download')}
                className="rounded-3xl bg-slate-100 px-5 py-3 text-slate-700 transition hover:bg-slate-200"
              >
                Download PDF
              </button>
            </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
