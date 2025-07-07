Using Chakra in Vite
A guide for installing Chakra UI with Vite.js projects

Templates
Use the vite template below to get started quickly.

Vite template

Installation
The minimum node version required is Node.20.x

1
Install dependencies
npm i @chakra-ui/react @emotion/react
2
Add snippets
Snippets are pre-built components that you can use to build your UI faster. Using the @chakra-ui/cli you can add snippets to your project.

npx @chakra-ui/cli snippet add
3
Update tsconfig
If you're using TypeScript, in the tsconfig.app.json file, make sure the compilerOptions includes the following:

tsconfig.app.json

{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
If you're using JavaScript, create a jsconfig.json file and add the above code to the file.

4
Setup provider
Wrap your application with the Provider component at the root of your application.

This provider composes the following:

ChakraProvider from @chakra-ui/react for the styling system
ThemeProvider from next-themes for color mode
src/main.tsx

import { Provider } from "@/components/ui/provider"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>,
)
5
Setup Vite Config Paths
In your project, set up a vite config path to automatically sync tsconfig with vite using the command:

npm i -D vite-tsconfig-paths
Update the vite.config.ts file:

import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
})
6
Enjoy!
With the power of the snippets and the primitive components from Chakra UI, you can build your UI faster.

import { Button, HStack } from "@chakra-ui/react"

const Demo = () => {
  return (
    <HStack>
      <Button>Click me</Button>
      <Button>Click me</Button>
    </HStack>
  )
}