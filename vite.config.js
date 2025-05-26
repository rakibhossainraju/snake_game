import {defineConfig} from 'vite';

/** @type {import('vite').UserConfig} */
export default defineConfig({
    root: './view',
    build: {
        outDir: "./public",
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