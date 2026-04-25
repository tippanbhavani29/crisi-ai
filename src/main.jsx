import { StrictMode } from 'react'
// Build Timestamp: 2026-04-25T04:05:40Z
import { createRoot } from 'react-dom/client'
import { CrisisProvider } from './context/CrisisContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CrisisProvider>
      <App />
    </CrisisProvider>
  </StrictMode>,
)
