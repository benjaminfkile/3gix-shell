import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Root imports only, so the shared @mui/material singleton is the one in use.
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { App } from "./App";

const theme = createTheme({ palette: { mode: "dark" } });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
