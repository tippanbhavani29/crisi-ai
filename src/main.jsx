import { StrictMode } from 'react'
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
