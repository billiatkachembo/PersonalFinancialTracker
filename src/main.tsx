import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing in index.html');

createRoot(container).render(
  <HashRouter>
    <App />
  </HashRouter>
);

// Mark app as loaded so the fallback doesn’t show
window.__APP_LOADED__ = true;
