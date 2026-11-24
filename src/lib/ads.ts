import type { AdCreative, AdPlacement, AdSlotResponse } from '@/types';

import { getApiBaseUrl } from './api';

/**
 * En desarrollo pasamos por el rewrite de `next.config.ts` para evitar CORS;
 * en producción (export estático) hablamos directo con la API.
 */
function adsApiBase(): string {
  return process.env.NODE_ENV === 'development' ? '/api-proxy' : getApiBaseUrl();
}

/** Qué slot del backend corresponde a cada ruta del sidebar. */
export function getPlacementKeyForPath(pathname: string): string {
  if (pathname.startsWith('/products')) return 'product_sidebar';
  if (pathname.startsWith('/streamings')) return 'ppv_sidebar';
  return 'home_sidebar';
}

export function getPlacementUrl(key: string): string {
  return `${adsApiBase()}/placements/${encodeURIComponent(key)}`;
}

export function getImpressionUrl(): string {
  return `${adsApiBase()}/ads/impression`;
}

function asTrimmed(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asNullableText(value: unknown): string | null {
  const text = asTrimmed(value);
  return text === '' ? null : text;
}

function normalizeCreative(raw: unknown): AdCreative {
  const record = (
    typeof raw === 'object' && raw !== null ? raw : {}
  ) as Record<string, unknown>;

  return {
    campaign_key: asTrimmed(record.campaign_key),
    name: asTrimmed(record.name),
    image_url: asTrimmed(record.image_url),
    alt_text: asNullableText(record.alt_text),
    headline: asNullableText(record.headline),
    body: asNullableText(record.body),
    cta_label: asNullableText(record.cta_label),
    target_url: asTrimmed(record.target_url),
    click_url: asTrimmed(record.click_url),
  };
}

/**
 * Valida el envelope y normaliza textos.
 *
 * El contrato pide NO reordenar ni filtrar creatividades: el backend ya las
 * recorta a `max_items` y las ordena por prioridad.
 */
export function normalizeAdSlot(raw: unknown): AdSlotResponse {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Ads: la respuesta no es un objeto.');
  }

  const record = raw as Record<string, unknown>;

  if (!Array.isArray(record.creatives)) {
    throw new Error('Ads: la respuesta no trae creatives.');
  }

  const placementRecord = (
    typeof record.placement === 'object' && record.placement !== null
      ? record.placement
      : {}
  ) as Record<string, unknown>;

  const placement: AdPlacement = {
    key: asTrimmed(placementRecord.key),
    name: asTrimmed(placementRecord.name),
    max_items:
      typeof placementRecord.max_items === 'number'
        ? placementRecord.max_items
        : 0,
  };

  return {
    placement,
    creatives: record.creatives.map(normalizeCreative),
  };
}

export async function fetchAdSlot(
  key: string,
  signal?: AbortSignal,
): Promise<AdSlotResponse> {
  const response = await fetch(getPlacementUrl(key), { signal });

  if (!response.ok) {
    throw new Error(`Ads: HTTP ${response.status}`);
  }

  return normalizeAdSlot(await response.json());
}

const UUID_STORAGE_KEY = 'onlysfree:ads-uuid';

/** Identidad estable para que el backend deduplique impresiones por día. */
function getAdsUuid(): string | undefined {
  try {
    if (typeof window === 'undefined') return undefined;

    const existing = window.localStorage.getItem(UUID_STORAGE_KEY);
    if (existing) return existing;

    const uuid =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    window.localStorage.setItem(UUID_STORAGE_KEY, uuid);
    return uuid;
  } catch {
    // Storage bloqueado (modo privado, etc.): el backend deduplica por IP.
    return undefined;
  }
}

export interface AdImpressionPayload {
  creative: string;
  placement: string;
}

/**
 * Beacon de impresión. `sendBeacon` sobrevive a la navegación; si no está
 * disponible, `fetch` con `keepalive` hace lo mismo.
 */
export function sendAdImpression({
  creative,
  placement,
}: AdImpressionPayload): void {
  const url = getImpressionUrl();
  const body = JSON.stringify({ creative, placement, uuid: getAdsUuid() });

  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.sendBeacon === 'function'
  ) {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon(url, blob)) return;
  }

  if (typeof fetch === 'function') {
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // Una impresión perdida no debe romper la UI.
    });
  }
}
