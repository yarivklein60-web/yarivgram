import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { LibraryProvider } from './lib/library';
import { PlayerProvider } from './lib/player';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <LibraryProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </LibraryProvider>
    </HashRouter>
  </React.StrictMode>,
);
