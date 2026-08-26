import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { contractApi } from '../api/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function UploadContract() {
  
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ name: '', vendor: '', category: 'General', status: 'Active', start_date: '', end_date: '', amount: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const isValidDateValue = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file && !form.description.trim()) {
      setMessage('Add a short description or upload a PDF contract before submitting.')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      if (file) {
        const data = new FormData()
        data.append('file', file)
        Object.entries(form).forEach(([key, value]) => {
          if (!value) return
          if ((key === 'start_date' || key === 'end_date') && !isValidDateValue(value)) return
          data.append(key, value)
        })
        await contractApi.upload(data)
      } else {
        const payload = {
          name: form.name || 'Untitled Contract',
          vendor: form.vendor || 'Unknown Vendor',
          category: form.category || 'General',
          status: form.status || 'Active',
          start_date: isValidDateValue(form.start_date) ? form.start_date : null,
          end_date: isValidDateValue(form.end_date) ? form.end_date : null,
          amount: form.amount || null,
          description: form.description || 'Contract created from the dashboard form.'
        }
        await contractApi.create(payload)
      }

      navigate('/contracts')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="md:grid md:grid-cols-[18rem_1fr]">
        <Sidebar />
        <main className="min-h-screen flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">Upload Contract</h1>
                <p className="mt-2 text-slate-500">Upload a PDF or add a short contract description to create AI-assisted risk insights instantly.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Accepted: PDF or text entry</div>
            </div>

            {message && <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div>}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Contract Name</span>
                  <input
                    type="text"
                    placeholder="Contract Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-2 w-full"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Vendor</span>
                  <input
                    type="text"
                    placeholder="Vendor"
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    className="mt-2 w-full"
                  />
                </label>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Category</span>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-2 w-full"
                  >
                    <option>General</option>
                    <option>Vendor</option>
                    <option>Service</option>
                    <option>Sales</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Status</span>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-2 w-full"
                  >
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Expired</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Contract File</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="mt-2 w-full"
                  />
                </label>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Start Date</span>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="mt-2 w-full"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">End Date</span>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="mt-2 w-full"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Value</span>
                  <input
                    type="number"
                    placeholder="Contract Value"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="mt-2 w-full"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Contract Overview</span>
                <textarea
                  rows="5"
                  placeholder="Contract overview or summary"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-2 w-full"
                />
              </label>
              <button
                disabled={submitting}
                className="w-full rounded-3xl bg-brand-700 px-6 py-3 text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? 'Uploading...' : 'Upload Contract'}
              </button>
            </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
