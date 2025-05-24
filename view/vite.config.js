import {defineConfig} from 'vite';

/** @type {import('vite').UserConfig} */
export default defineConfig({
    build: {
        outDir: "public",
        input: {
            app: "./src/bootstrap.js",
        },
    },
    server: {
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
        fs: {
            // Allow serving files from one level up to the project root
            allow: ['..']
        }
    },
    optimizeDeps: {
        exclude: ['snake_game']
    }
});