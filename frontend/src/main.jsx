import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { SocketProvider } from './pages/SocketContext.jsx'
import { AuthProvider } from './pages/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
    <AuthProvider>
    <SocketProvider>
    <App />
    </SocketProvider>
    </AuthProvider>
    </BrowserRouter>
)
