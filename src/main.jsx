import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ToastProvider } from './contexts/ToastContext'
import './index.css'

const storedTheme = localStorage.getItem('app_theme_v1') || 'system'
const resolved =
  storedTheme === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : storedTheme
document.documentElement.classList.toggle('dark', resolved === 'dark')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>,
)

