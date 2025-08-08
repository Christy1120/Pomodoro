import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './tw-check.css';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <div className="text-emerald-600 font-bold">Tailwind OK?</div>

  </StrictMode>,
)
