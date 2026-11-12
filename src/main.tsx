import '@tokens/tokens.css';
import './app/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerFonts } from './app/fonts';
import App from './app/App';

registerFonts();
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
