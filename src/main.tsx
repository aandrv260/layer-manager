import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LayerProvider from '@/ui/context/LayerProvider'
import { LayerManager } from '@/core/LayerManager'
import { ConsoleLogger } from '@/utils/ConsoleLogger'

const layerManager = new LayerManager(new ConsoleLogger())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LayerProvider layerManager={layerManager}>
      <App />
    </LayerProvider>
  </StrictMode>,
)
