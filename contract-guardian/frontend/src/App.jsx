import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { UIProvider } from './contexts/UIContext'
import { Router } from './router'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <div className="min-h-screen bg-slate-100 text-slate-900">
            <Router />
          </div>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
