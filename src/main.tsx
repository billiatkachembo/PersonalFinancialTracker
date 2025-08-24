import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

try {
  const container = document.getElementById('root');
  if (!container) throw new Error('Root container missing in index.html');

  // Show loading spinner initially
  const loadingElement = document.createElement('div');
  loadingElement.innerHTML = `
    <div style="/* same as above */">
      <!-- loading content -->
    </div>
  `;
  document.body.appendChild(loadingElement);

  // Render your app
  createRoot(container).render(
    <HashRouter>
      <App />
    </HashRouter>
  );

  // Mark app as loaded and remove loading spinner
  window.__APP_LOADED__ = true;
  setTimeout(() => loadingElement.remove(), 100);

} catch (error) {
  console.error('Failed to initialize application:', error);
  
  // Show error message to user
  const container = document.getElementById('root') || document.body;
  container.innerHTML = `
    <div style="
      padding: 2rem;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <h2>Application Error</h2>
      <p>Sorry, something went wrong while loading the application.</p>
      <button onclick="window.location.reload()" style="
        background: #2F855A;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        cursor: pointer;
        margin-top: 1rem;
      ">
        Reload Page
      </button>
    </div>
  `;
}