import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import { App } from './App'
import { AuthProvider } from './features/auth/auth-context'
import { ConfirmarProvider } from './components/common/confirmar'
import { Toaster } from './components/ui/sonner'
import { TemaProvider } from './hooks/use-tema'
import { queryClient } from './lib/query-client'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TemaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ConfirmarProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <App />
            </BrowserRouter>
            <Toaster />
          </ConfirmarProvider>
        </AuthProvider>
      </QueryClientProvider>
    </TemaProvider>
  </StrictMode>,
)
