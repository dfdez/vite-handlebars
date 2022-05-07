// vite.config.js
import { defineConfig } from 'vite';
import hbs from 'vite-plugin-hbs';
import hbsConfig from './hbs.config.js';

export default defineConfig({
  plugins: [hbs(hbsConfig)],
  root: 'src',
  build: {
    outDir: '../dist'
  }
})