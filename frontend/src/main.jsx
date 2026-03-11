import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#161630',
            color: '#e8e8ff',
            border: '1px solid #252550',
            borderRadius: '10px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#050510' },
            style: { borderLeft: '3px solid #10b981' }
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#050510' },
            style: { borderLeft: '3px solid #f43f5e' }
          },
          loading: {
            iconTheme: { primary: '#6366f1', secondary: '#050510' },
            style: { borderLeft: '3px solid #6366f1' }
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
