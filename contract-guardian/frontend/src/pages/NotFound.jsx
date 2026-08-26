import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4 text-center text-slate-900">
      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 shadow-soft">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-4 text-xl text-slate-700">Page not found.</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-2xl bg-brand-700 px-6 py-3 text-white transition hover:bg-brand-800"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}
