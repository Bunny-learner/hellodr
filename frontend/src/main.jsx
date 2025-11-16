import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { SocketProvider } from './pages/SocketContext.jsx'
import { AuthProvider } from './pages/AuthContext.jsx'



if ('serviceWorker' in navigator) {
  // We register it on 'load' to not block the app's initial render
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered successfully:', registration);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}


createRoot(document.getElementById('root')).render(
    <BrowserRouter>
    <AuthProvider>
    <SocketProvider>
    <App />
    </SocketProvider>
    </AuthProvider>
    </BrowserRouter>
)