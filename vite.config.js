import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';
import autoprefixer from 'autoprefixer';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// https://vite.dev/config/
export default defineConfig({
    css: {
        postcss: {
            plugins: [
                autoprefixer(),
            ],
        },
    },
    plugins: [vue()],
    build: {
        lib: {
            entry: resolve(__dirname, './packages/index.ts'),
            name: '@creatorsn/powereditor3',
            fileName: 'powereditor3',
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
});
