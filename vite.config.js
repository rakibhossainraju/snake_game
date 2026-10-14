import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';

/** @type {import('vite').UserConfig} */
export default defineConfig({
    root: './view',
    resolve: {
        alias: {
            snake_game: fileURLToPath(new URL('./pkg/snake_game.js', import.meta.url)),
        },
    },
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        input: {
            app: "./src/bootstrap.ts",
        },
    },
    server: {
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
    },
    optimizeDeps: {
        exclude: ["snake_game"]
    }
});