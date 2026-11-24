import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  fetchAdSlot,
  getPlacementKeyForPath,
  getPlacementUrl,
  normalizeAdSlot,
  sendAdImpression,
} from './ads';

const creative = {
  campaign_key: 'game-home_sidebar',
  name: 'Bellseboss Studio',
  image_url: 'https://cdn.test/bellseboss.png',
  alt_text: 'Bellseboss Studio',
  headline: 'Bellseboss Studio',
  body: null,
  cta_label: 'Ver más',
  target_url: 'https://bellseboss.itch.io/',
  click_url: 'http://localhost/ads/game-home_sidebar',
};

const slot = {
  placement: { key: 'home_sidebar', name: 'Home sidebar', max_items: 1 },
  creatives: [creative],
};

function stubBeacon(returnValue = true) {
  const beacon = vi.fn().mockReturnValue(returnValue);
  Object.defineProperty(navigator, 'sendBeacon', {
    value: beacon,
    configurable: true,
    writable: true,
  });
  return beacon;
}

// jsdom no implementa Blob.text(); FileReader sí está disponible.
function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

afterEach(() => {
  Object.defineProperty(navigator, 'sendBeacon', {
    value: undefined,
    configurable: true,
    writable: true,
  });
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('getPlacementKeyForPath', () => {
  it('usa home_sidebar en la home', () => {
    expect(getPlacementKeyForPath('/')).toBe('home_sidebar');
  });

  it('usa product_sidebar en páginas de producto', () => {
    expect(getPlacementKeyForPath('/products/detail')).toBe('product_sidebar');
    expect(getPlacementKeyForPath('/products/42')).toBe('product_sidebar');
  });

  it('usa ppv_sidebar en streamings', () => {
    expect(getPlacementKeyForPath('/streamings')).toBe('ppv_sidebar');
  });

  it('cae en home_sidebar para el resto', () => {
    expect(getPlacementKeyForPath('/deals/daily')).toBe('home_sidebar');
    expect(getPlacementKeyForPath('/search/tag')).toBe('home_sidebar');
  });
});

describe('getPlacementUrl', () => {
  it('usa el proxy en desarrollo', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(getPlacementUrl('home_sidebar')).toBe(
      '/api-proxy/placements/home_sidebar',
    );
  });

  it('usa la API directa fuera de desarrollo', () => {
    vi.stubEnv('NODE_ENV', 'test');

    expect(getPlacementUrl('home_sidebar')).toContain(
      '/placements/home_sidebar',
    );
    expect(getPlacementUrl('home_sidebar')).not.toContain('/api-proxy');
  });

  it('escapa la key', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(getPlacementUrl('a b')).toBe('/api-proxy/placements/a%20b');
  });
});

describe('normalizeAdSlot', () => {
  it('acepta un slot válido y conserva el orden', () => {
    const second = { ...creative, campaign_key: 'second' };
    const result = normalizeAdSlot({ ...slot, creatives: [creative, second] });

    expect(result.creatives.map((c) => c.campaign_key)).toEqual([
      'game-home_sidebar',
      'second',
    ]);
  });

  it('normaliza textos vacíos a null', () => {
    const result = normalizeAdSlot({
      ...slot,
      creatives: [{ ...creative, alt_text: '  ', body: '  ', cta_label: null }],
    });

    expect(result.creatives[0].alt_text).toBeNull();
    expect(result.creatives[0].body).toBeNull();
    expect(result.creatives[0].cta_label).toBeNull();
  });

  it('recorta espacios', () => {
    const result = normalizeAdSlot({
      ...slot,
      creatives: [{ ...creative, headline: '  Hola  ' }],
    });

    expect(result.creatives[0].headline).toBe('Hola');
  });

  it('rechaza una respuesta sin creatives', () => {
    expect(() => normalizeAdSlot({ placement: slot.placement })).toThrow(
      /creatives/,
    );
  });

  it('rechaza una respuesta que no es objeto', () => {
    expect(() => normalizeAdSlot(null)).toThrow();
    expect(() => normalizeAdSlot('texto')).toThrow();
  });
});

describe('fetchAdSlot', () => {
  it('pide el placement y devuelve el slot', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(slot), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchAdSlot('home_sidebar')).resolves.toEqual(slot);
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      '/placements/home_sidebar',
    );
  });

  it('lanza con el status cuando la respuesta no es ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('nope', { status: 404 })),
    );

    await expect(fetchAdSlot('nope')).rejects.toThrow(/404/);
  });
});

describe('sendAdImpression', () => {
  it('usa sendBeacon con el payload y un uuid', async () => {
    const beacon = stubBeacon();

    sendAdImpression({ creative: 'game-home_sidebar', placement: 'home_sidebar' });

    expect(beacon).toHaveBeenCalledTimes(1);

    const [url, blob] = beacon.mock.calls[0];
    expect(String(url)).toContain('/ads/impression');

    const payload = JSON.parse(await readBlob(blob as Blob));
    expect(payload).toMatchObject({
      creative: 'game-home_sidebar',
      placement: 'home_sidebar',
    });
    expect(typeof payload.uuid).toBe('string');
  });

  it('hace fallback a fetch keepalive si sendBeacon no está disponible', () => {
    Object.defineProperty(navigator, 'sendBeacon', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    sendAdImpression({ creative: 'c1', placement: 'home_sidebar' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/ads/impression'),
      expect.objectContaining({ method: 'POST', keepalive: true }),
    );
  });
});
