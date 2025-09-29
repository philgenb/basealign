import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor"; // Default import

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        monacoEditorPlugin.default({
            languageWorkers: ["editorWorkerService", "css", "html", "json", "typescript"],
        }),
    ],
});
