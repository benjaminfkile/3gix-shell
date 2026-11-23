/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

const env = process.env;

function tls(): { cert: Buffer; key: Buffer } | undefined {
  const cert = env.GX_TLS_CERT;
  const key = env.GX_TLS_KEY;
  if (!cert || !key) return undefined;
  return { cert: readFileSync(cert), key: readFileSync(key) };
}

const host = env.GX_HOST || "localhost";
const port = Number(env.GX_SHELL_PORT || 5180);
const https = tls();

// Same majors as 3gix-earth. The remote itself is registered at runtime (src/remote.ts).
const shared = {
  react: { singleton: true, requiredVersion: "^19.0.0" },
  "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
  "@mui/material": { singleton: true, requiredVersion: "^9.0.0" },
  "@emotion/react": { singleton: true, requiredVersion: "^11.0.0" },
  "@emotion/styled": { singleton: true, requiredVersion: "^11.0.0" },
};

export default defineConfig({
  define: {
    "import.meta.env.GX_EARTH_URL": JSON.stringify(env.GX_EARTH_URL ?? ""),
  },
  plugins: [
    react(),
    federation({
      name: "gx_shell",
      remotes: {},
      shared,
      dts: false,
    }),
  ],
  server: { host, port, strictPort: true, https },
  preview: { host, port, strictPort: true, https },
  build: { target: "esnext" },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
