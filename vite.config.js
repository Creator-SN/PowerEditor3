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
            entry: {
                powereditor3: resolve(__dirname, './packages/index.ts'),
                collaboration: resolve(__dirname, './packages/collaboration/index.ts'),
            },
            fileName: (_, name) => `${name}.js`,
            cssFileName: 'powereditor3',
            formats: ['es'],
        },
        rollupOptions: {
            external: ['vue', /^@tiptap\/(?:core|pm|vue-3|extension-collaboration|extension-drag-handle-vue-3|y-tiptap)(?:\/|$)/, /^prosemirror-/, /^yjs$/, /^y-protocols(?:\/|$)/],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
});
