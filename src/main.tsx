import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SpeechProvider } from './components/Speech';
import './base.css';
import './flow.css';

createRoot(document.getElementById('root')!).render(<StrictMode><SpeechProvider><App /></SpeechProvider></StrictMode>);
