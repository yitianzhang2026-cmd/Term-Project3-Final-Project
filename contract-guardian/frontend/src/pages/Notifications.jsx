import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import { notificationApi } from '../api/api'

export default function Notifications() {
  
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationApi.list().then((res) => setNotifications(res.data.notifications)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleMarkRead = async (id) => {
    await notificationApi.markRead(id)
    setNotifications((current) => current.map((note) => (note.id === id ? { ...note, read: true } : note)))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="md:grid md:grid-cols-[18rem_1fr]">
        <Sidebar />
        <main className="min-h-screen flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
            <h1 className="text-3xl font-semibold text-slate-900">Notifications</h1>
            <p className="mt-2 text-slate-500">All contract alerts and actions in one feed.</p>

            <div className="mt-8 space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`rounded-3xl border p-5 ${notification.read ? 'border-slate-200 bg-slate-50' : 'border-brand-200 bg-brand-50'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-slate-900">{notification.message}</p>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        className="rounded-2xl bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{new Date(notification.created_at).toLocaleString()}</p>
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
