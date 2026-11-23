import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@module-federation/runtime", () => ({ loadRemote: vi.fn(), registerRemotes: vi.fn() }));

import { App } from "./App";
import type { EarthComponent } from "./remote";

const ENTRY = "http://localhost:5181/remoteEntry.js";

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const Earth: EarthComponent = () => <div>earth app</div>;

describe("App", () => {
  it("shows progress, then the component", async () => {
    const d = deferred<EarthComponent>();
    const load = vi.fn(() => d.promise);
    render(<App entry={ENTRY} load={load} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(load).toHaveBeenCalledWith(ENTRY);

    d.resolve(Earth);
    expect(await screen.findByText("earth app")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("on failure shows the URL and error, and retry loads again", async () => {
    const load = vi
      .fn<(entry: string) => Promise<EarthComponent>>()
      .mockRejectedValueOnce(new Error("Failed to fetch"))
      .mockResolvedValueOnce(Earth);
    render(<App entry={ENTRY} load={load} />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByTestId("entry-url")).toHaveTextContent(ENTRY);
    expect(screen.getByTestId("error-message")).toHaveTextContent("Failed to fetch");
    expect(load).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(load).toHaveBeenCalledTimes(2);
    expect(await screen.findByText("earth app")).toBeInTheDocument();
  });
});
