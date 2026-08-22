import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Auto-recover from stale dynamic chunk imports on new deployments
window.addEventListener('vite:preloadError', (event) => {
  const sessionKey = 'vite_preload_error_retried';
  if (!sessionStorage.getItem(sessionKey)) {
    sessionStorage.setItem(sessionKey, 'true');
    window.location.reload();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

