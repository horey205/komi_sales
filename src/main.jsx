import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Remove StrictMode to prevent double-renders that sometimes break IME composition on mobile
createRoot(document.getElementById('root')).render(
  <App />
)
