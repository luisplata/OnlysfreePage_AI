/**
 * Base URLs for the OnlysFree API and admin site.
 *
 * Values come from NEXT_PUBLIC_* environment variables so the same code can
 * target a local Laravel backend, the test environment, or production.
 *
 * IMPORTANT: NEXT_PUBLIC_* values are inlined at BUILD time.
 *   - Local dev  -> read `.env.local` (see `.env.example`)
 *   - Production -> defaults below apply when the variables are absent
 */

const DEFAULT_API_URL = 'https://admin.onlysfree.com/api';
const DEFAULT_WEB_URL = 'https://admin.onlysfree.com';

/** Removes trailing slashes so `${BASE_API_URL}/packs` never doubles them. */
const normalizeUrl = (url: string) => url.replace(/\/+$/, '');

/**
 * Read at call time, not at import time. `next.config.ts` uses these after it
 * has loaded the `.env*` files, because Next evaluates the config before its
 * own environment loading kicks in.
 */
export function getApiBaseUrl(): string {
  return normalizeUrl(process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL);
}

export function getWebBaseUrl(): string {
  return normalizeUrl(process.env.NEXT_PUBLIC_WEB_URL || DEFAULT_WEB_URL);
}

export const BASE_API_URL = getApiBaseUrl();
export const BASE_WEB_URL = getWebBaseUrl();
