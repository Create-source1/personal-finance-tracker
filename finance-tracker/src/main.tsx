// import { StrictMode } from 'react'
// import ReactDOM from 'react-dom/client';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
        <App />
  </BrowserRouter>
  // <StrictMode>
  // </StrictMode>,
)
