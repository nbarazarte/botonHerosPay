/* import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: 'REACT_APP_',
  //base: '/boton/'
}) */

  import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'replace-eval',
      transform(code) {
        return code.replace(/eval\(/g, 'safeEval(');
      },
    },
  ],
  envPrefix: 'REACT_APP_',
  // base: '/boton/'
})
