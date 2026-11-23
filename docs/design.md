# 3gix-shell design

Approved by Ben 2026-11-23. This is the contract for this repository.

`3gix-shell` is a bare host app. Its only job is to load one micro frontend, `3gix-earth`, at runtime and give it the whole page. It knows nothing about Earth, the renderer, or the hub, and depends on none of their packages.

## 1. Stack

- Vite, React 19, TypeScript (strict), Material UI (MUI).
- Module Federation through `@module-federation/vite` as the host. React, `react-dom`, `@mui/material`, `@emotion/react`, and `@emotion/styled` are shared singletons, the same major versions as `3gix-earth`.
- Tests: vitest with jsdom. `npm run ci` runs type checks, tests, and the production build, and prints `ci ok`.

## 2. Loading the MFE

1. The remote `gx_earth` is registered at runtime (the Module Federation runtime's `registerRemotes` and `loadRemote`), not at build time, and its module `./EarthApp` is rendered full page.
2. Its entry URL is `GX_EARTH_URL` when set at build or dev time; otherwise it is built from the page's own address: the same protocol and hostname, port `5181`, path `/remoteEntry.js`. So the shell opened from another device on the network finds the MFE on the same machine.
3. While loading: a centered MUI progress indicator. If loading fails: an MUI alert naming the URL it tried and the error, with a retry button. Never a blank page.
4. The page has no chrome of its own: `CssBaseline`, a dark theme, and the MFE filling the viewport (`100dvh`).

## 3. Serving

| Variable | Use |
|---|---|
| `GX_TLS_CERT`, `GX_TLS_KEY` | Paths to a certificate and key. When both are set the dev server uses HTTPS; otherwise HTTP. |
| `GX_HOST` | Address to bind (default `localhost`). |
| `GX_SHELL_PORT` | Port (default `5180`). |
| `GX_EARTH_URL` | Optional, see section 2. |

Nothing that names a machine or a key is committed.
