import { useCallback, useEffect, useState } from "react";
import { Alert, AlertTitle, Box, Button, CircularProgress, Typography } from "@mui/material";
import { currentEntryUrl, loadEarthApp, type EarthComponent } from "./remote";

export interface AppProps {
  /** Entry URL of the remote. */
  entry?: string;
  /** Loads the remote component from `entry`. */
  load?: (entry: string) => Promise<EarthComponent>;
}

type State =
  | { kind: "loading" }
  | { kind: "ready"; Component: EarthComponent }
  | { kind: "error"; message: string };

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message || err.name;
  return String(err);
}

const fill = { width: "100%", height: "100dvh" } as const;
const center = { ...fill, display: "flex", alignItems: "center", justifyContent: "center", p: 2 } as const;

export function App({ entry = currentEntryUrl(), load = loadEarthApp }: AppProps) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    setState({ kind: "loading" });
    load(entry).then(
      (Component) => live && setState({ kind: "ready", Component }),
      (err: unknown) => live && setState({ kind: "error", message: errorMessage(err) }),
    );
    return () => {
      live = false;
    };
  }, [entry, load, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (state.kind === "ready") {
    const { Component } = state;
    return (
      <Box sx={{ ...fill, overflow: "hidden" }}>
        <Component />
      </Box>
    );
  }

  if (state.kind === "error") {
    return (
      <Box sx={center}>
        <Alert
          severity="error"
          sx={{ maxWidth: 640, wordBreak: "break-word" }}
          action={
            <Button color="inherit" size="small" onClick={retry}>
              Retry
            </Button>
          }
        >
          <AlertTitle>Could not load the Earth app</AlertTitle>
          <Typography variant="body2">
            Tried <code data-testid="entry-url">{entry}</code>
          </Typography>
          <Typography variant="body2" data-testid="error-message">
            {state.message}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={center}>
      <CircularProgress aria-label="Loading the Earth app" />
    </Box>
  );
}
