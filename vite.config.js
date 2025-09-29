import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import {nodePolyfills} from "vite-plugin-node-polyfills";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        monacoEditorPlugin.default({
            languageWorkers: ["editorWorkerService", "css", "html", "json", "typescript"],
        }),
        nodePolyfills({
            protocolImports: true, // polyfill für node:url, node:path etc.
        }),
    ],
    resolve: {alias: {"@": "/src"}}
});
