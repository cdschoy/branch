import '@tokens/tokens.css';
import './app/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerFonts } from './app/fonts';
import App from './app/App';
import { initLocale } from './i18n';

registerFonts();
initLocale(); // saved choice → browser language → 'vi'; sets <html lang>
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
