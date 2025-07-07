import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { ClerkProvider } from '@clerk/clerk-react'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './index.css'
import App from './App.tsx'
import theme from './theme'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ClerkProvider 
      publishableKey={publishableKey}
      routerPush={(to) => window.history.pushState({}, '', to)}
      routerReplace={(to) => window.history.replaceState({}, '', to)}
    >
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </ClerkProvider>
  </StrictMode>,
)
