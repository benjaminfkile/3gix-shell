# 3gix-shell

A bare host app that loads the `3gix-earth` micro frontend at runtime and gives it the whole page. It knows nothing about Earth, the renderer, or the hub, and depends on none of their packages.

Design: `docs/design.md`.

## How it works

- `vite.config.ts` sets up `@module-federation/vite` as a host with `react`, `react-dom`, `@mui/material`, `@emotion/react`, and `@emotion/styled` as shared singletons. No remote is declared at build time.
- `src/remote.ts` works out the entry URL of the `gx_earth` remote, registers it with the Module Federation runtime (`registerRemotes`), and loads `gx_earth/EarthApp` (`loadRemote`).
- `src/App.tsx` shows a centered progress indicator while loading, an error alert with the URL tried, the error, and a Retry button if loading fails, and otherwise the Earth app filling the viewport.
- `src/main.tsx` adds `CssBaseline` and a dark theme.

## Environment variables

None are committed. Set them in your shell or in a local `.env` file (ignored by git).

| Variable | Use |
|---|---|
| `GX_TLS_CERT`, `GX_TLS_KEY` | Paths to a certificate and key. When both are set the dev and preview servers use HTTPS; otherwise HTTP. |
| `GX_HOST` | Address to bind (default `localhost`). |
| `GX_SHELL_PORT` | Port (default `5180`). |
| `GX_EARTH_URL` | Optional entry URL of the remote, read at build or dev time. When unset, the shell uses the page's own protocol and hostname with port `5181` and path `/remoteEntry.js`, so a shell opened from another device on the network finds the MFE on the same machine. A value that starts with `:` is a port and path on the page's own protocol and hostname, for example `:6181/remoteEntry.js`. |

## Running it next to 3gix-earth

1. In `3gix-earth`, install and start its dev server (port `5181` by default; see its README for its own variables).
2. Here:

   ```sh
   npm install
   npm run dev
   ```

3. Open the shell on port `5180`. Use the same protocol for both servers (set the same `GX_TLS_CERT` and `GX_TLS_KEY` for both, or neither), since an HTTPS page cannot load an HTTP remote. To open it from another device, set `GX_HOST` so both servers listen on the network.

If the MFE is not running, the shell shows the URL it tried and the error, with a Retry button.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Dev server. |
| `npm run build` | Production build into `dist`. |
| `npm run preview` | Serves the production build. |
| `npm test` | Unit tests (vitest, jsdom). The remote loader is mocked. |
| `npm run typecheck` | TypeScript, strict. |
| `npm run ci` | Type checks, tests, build, then prints `ci ok`. |
