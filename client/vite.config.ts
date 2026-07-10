import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";

function typedocRedirectPlugin(): Plugin {
    const middleware = (req: { url?: string }, res: { statusCode: number; setHeader: (name: string, value: string) => void; end: () => void }, next: () => void) => {
        const url = req.url ?? "";
        if (url === "/typedoc" || url === "/typedoc/") {
            res.statusCode = 302;
            res.setHeader("Location", "/typedoc/index.html");
            res.end();
            return;
        }
        next();
    };

    return {
        name: "typedoc-redirect",
        configureServer(server) {
            server.middlewares.use(middleware);
        },
        configurePreviewServer(server) {
            server.middlewares.use(middleware);
        },
    };
}

// https://vite.dev/config/
export default defineConfig({
    base: process.env.GITHUB_PAGES === "true" ? "/Svg2GPU/" : "/",
    plugins: [react(), tailwindcss(), typedocRedirectPlugin()],
});
