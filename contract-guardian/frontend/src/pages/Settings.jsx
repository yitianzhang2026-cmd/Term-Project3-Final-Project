import { useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../contexts/AuthContext'

export default function Settings() {
  
  const { user } = useAuth()
  const [details, setDetails] = useState({ name: user?.name || '', email: user?.email || '', company: user?.company || '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('This demo application uses mocked profile settings. Update API integration to persist changes.')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="md:grid md:grid-cols-[18rem_1fr]">
        <Sidebar />
        <main className="min-h-screen flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <h1 className="text-3xl font-semibold text-slate-900">Settings</h1>
              <p className="mt-2 text-slate-500">Manage profile preferences and account settings.</p>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Full Name</span>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={details.name}
                      onChange={(e) => setDetails({ ...details, name: e.target.value })}
                      className="mt-2 w-full"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Email</span>
                    <input
                      type="email"
                      placeholder="Email"
                      value={details.email}
                      onChange={(e) => setDetails({ ...details, email: e.target.value })}
                      className="mt-2 w-full"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Company</span>
                  <input
                    type="text"
                    placeholder="Company"
                    value={details.company}
                    onChange={(e) => setDetails({ ...details, company: e.target.value })}
                    className="mt-2 w-full"
                  />
                </label>
                <button className="rounded-3xl bg-brand-700 px-6 py-3 text-white transition hover:bg-brand-800">Save Changes</button>
              </form>
            </section>

            <aside className="rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">Account overview</h2>
              <p className="mt-3 text-slate-500">Your profile details help keep your contract workspace accurate and secure.</p>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="rounded-3xl bg-white p-4">
                  <p className="font-medium text-slate-900">Current role</p>
                  <p className="mt-1 text-slate-500">{user?.role || 'Member'}</p>
                </div>
                <div className="rounded-3xl bg-white p-4">
                  <p className="font-medium text-slate-900">Email</p>
                  <p className="mt-1 text-slate-500">{user?.email}</p>
                </div>
              </div>
            </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
