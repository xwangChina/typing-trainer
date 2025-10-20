import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { SettingsProvider } from './state/settings'
import { ProgressProvider } from './state/progress'
import { HistoryProvider } from './state/history'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <ProgressProvider>
        <HistoryProvider>
          <App />
        </HistoryProvider>
      </ProgressProvider>
    </SettingsProvider>
  </StrictMode>,
)
