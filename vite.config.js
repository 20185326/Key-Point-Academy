import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Key-Point-Academy/',  // Asegúrate de que 'Key-Point-Academy' coincide con el nombre de tu repositorio
})