
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initDataLayer } from './services/analyticService';

// Initialize dataLayer for GTM
initDataLayer();

// Rendering application
createRoot(document.getElementById("root")!).render(<App />);
