import type { ComponentType } from "react";
import { loadRemote, registerRemotes } from "@module-federation/runtime";

export const REMOTE_NAME = "gx_earth";
export const REMOTE_MODULE = `${REMOTE_NAME}/EarthApp`;
export const EARTH_PORT = 5181;

/** The part of the page address the entry URL is built from. */
export interface PageLocation {
  protocol: string;
  hostname: string;
}

/**
 * Entry URL of the remote (design section 2 item 2): the configured URL when
 * set, otherwise the page's protocol and hostname on port 5181. A configured
 * value that starts with ":" is a port and path on the page's own protocol and
 * hostname (":6181/remoteEntry.js").
 */
export function earthEntryUrl(configured: string | undefined, page: PageLocation): string {
  const url = configured?.trim();
  const host = page.hostname.includes(":") && !page.hostname.startsWith("[") ? `[${page.hostname}]` : page.hostname;
  if (url?.startsWith(":")) return `${page.protocol}//${host}${url}`;
  if (url) return url;
  return `${page.protocol}//${host}:${EARTH_PORT}/remoteEntry.js`;
}

/** Entry URL for this build and page. */
export function currentEntryUrl(): string {
  return earthEntryUrl(import.meta.env.GX_EARTH_URL, window.location);
}

export type EarthComponent = ComponentType<Record<string, never>>;

/** Registers the remote at `entry` and loads its EarthApp component. */
export async function loadEarthApp(entry: string): Promise<EarthComponent> {
  registerRemotes([{ name: REMOTE_NAME, entry, type: "module" }], { force: true });
  const mod = await loadRemote<{ default: EarthComponent } | EarthComponent>(REMOTE_MODULE);
  if (!mod) throw new Error(`${REMOTE_MODULE} returned nothing`);
  const component = typeof mod === "function" ? mod : mod.default;
  if (!component) throw new Error(`${REMOTE_MODULE} has no default export`);
  return component;
}
