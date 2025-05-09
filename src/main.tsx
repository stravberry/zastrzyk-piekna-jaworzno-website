
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getCodeSettings } from './services/codeSettingsService';
import { initDataLayer } from './services/analyticService';

// Initialize dataLayer for GTM
initDataLayer();

// Funkcja do wstrzykiwania kodu do head i body
const injectCustomCode = async () => {
  try {
    const settings = await getCodeSettings();
    
    // Wstrzykiwanie kodu do head
    if (settings.headCode) {
      const headScript = document.createElement('div');
      headScript.innerHTML = settings.headCode;
      
      // Dodajemy wszystkie elementy z div do head
      while (headScript.firstChild) {
        document.head.appendChild(headScript.firstChild);
      }
    }
    
    // Wstrzykiwanie kodu do body
    if (settings.bodyCode) {
      const bodyScript = document.createElement('div');
      bodyScript.innerHTML = settings.bodyCode;
      
      // Dodajemy skrypt do body na końcu
      document.addEventListener('DOMContentLoaded', () => {
        while (bodyScript.firstChild) {
          document.body.appendChild(bodyScript.firstChild);
        }
      });
    }
  } catch (error) {
    console.error('Error injecting custom code:', error);
  }
};

// Inicjalizacja wstrzykiwania kodu
injectCustomCode();

// Renderowanie aplikacji React
createRoot(document.getElementById("root")!).render(<App />);
