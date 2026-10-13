import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AdminAgenda } from './components/AdminAgenda'
import './index.css'

// /agenda abre a área da Bianca; o resto é o site normal
const isAgenda = window.location.pathname.replace(/\/+$/, '') === '/agenda'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isAgenda ? <AdminAgenda /> : <App />}
  </React.StrictMode>,
)
