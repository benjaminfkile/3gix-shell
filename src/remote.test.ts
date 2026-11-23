import { describe, expect, it, vi } from "vitest";

vi.mock("@module-federation/runtime", () => ({ loadRemote: vi.fn(), registerRemotes: vi.fn() }));

import { earthEntryUrl } from "./remote";

describe("earthEntryUrl", () => {
  const page = { protocol: "http:", hostname: "localhost" };

  it("uses the configured URL when set", () => {
    expect(earthEntryUrl("https://earth.example.test/remoteEntry.js", page)).toBe(
      "https://earth.example.test/remoteEntry.js",
    );
  });

  it("falls back to the page address when unset or empty", () => {
    expect(earthEntryUrl(undefined, page)).toBe("http://localhost:5181/remoteEntry.js");
    expect(earthEntryUrl("", page)).toBe("http://localhost:5181/remoteEntry.js");
    expect(earthEntryUrl("  ", page)).toBe("http://localhost:5181/remoteEntry.js");
  });

  it("keeps the page protocol", () => {
    expect(earthEntryUrl(undefined, { protocol: "https:", hostname: "localhost" })).toBe(
      "https://localhost:5181/remoteEntry.js",
    );
  });

  it("uses the page hostname when opened from another device", () => {
    expect(earthEntryUrl(undefined, { protocol: "https:", hostname: "devbox.example.test" })).toBe(
      "https://devbox.example.test:5181/remoteEntry.js",
    );
  });

  it("brackets an IPv6 hostname", () => {
    expect(earthEntryUrl(undefined, { protocol: "http:", hostname: "::1" })).toBe(
      "http://[::1]:5181/remoteEntry.js",
    );
    expect(earthEntryUrl(undefined, { protocol: "http:", hostname: "[::1]" })).toBe(
      "http://[::1]:5181/remoteEntry.js",
    );
  });
});
