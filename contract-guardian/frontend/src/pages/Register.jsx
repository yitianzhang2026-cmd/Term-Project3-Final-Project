import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 text-slate-900">
      <div className="mx-auto grid max-w-6xl grid-cols-1 overflow-hidden rounded-[32px] bg-white shadow-soft lg:grid-cols-[1.2fr_0.8fr]">
        <div className="hidden rounded-l-[32px] bg-brand-700 p-12 text-white lg:block">
          <div className="max-w-md">
            <p className="text-sm uppercase tracking-[0.28em] text-brand-100">ContractGuardian</p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">Get started with smarter contract management.</h1>
            <p className="mt-6 text-slate-200">Join your team on a polished platform for tracking renewals, analyzing risk, and keeping agreements under control.</p>
            <div className="mt-10 space-y-4 rounded-3xl bg-white/10 p-6 text-sm">
              <p>• Fast upload and document processing</p>
              <p>• Intelligent contract summaries</p>
              <p>• Role-based access and audit tracking</p>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <h1 className="text-3xl font-semibold">Create your account</h1>
          <p className="mt-3 text-slate-500">Start protecting contract value with a modern centralized platform.</p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-2 w-full"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Company</span>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="mt-2 w-full"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-2 w-full"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="mt-2 w-full"
                  required
                />
              </label>
            </div>
            <button className="w-full rounded-3xl bg-brand-700 px-4 py-3 text-white transition hover:bg-brand-800">Get Started</button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-700 hover:text-brand-900">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
