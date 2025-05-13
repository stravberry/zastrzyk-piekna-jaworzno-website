
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initDataLayer } from './services/analyticService';
import { updateFavicon } from './services/faviconService';

// Initialize dataLayer for GTM
initDataLayer();

// Update the favicon with our custom Z icon
updateFavicon();

// Rendering application
createRoot(document.getElementById("root")!).render(<App />);
