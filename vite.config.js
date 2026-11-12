import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// base relativa: funciona em https://<conta>.github.io/<repo>/ sem configurar o nome do repositório
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'single' ? [viteSingleFile()] : [],
  build: { outDir: mode === 'single' ? 'dist-single' : 'dist', chunkSizeWarningLimit: 1500, assetsInlineLimit: mode === 'single' ? 1e8 : 4096 },
}));
