import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderHook, waitFor } from '@/test/utils';

import { useAdSlot } from './use-ad-slot';

const slot = {
  placement: { key: 'home_sidebar', name: 'Home sidebar', max_items: 1 },
  creatives: [
    {
      campaign_key: 'game-home_sidebar',
      name: 'Bellseboss Studio',
      image_url: 'https://cdn.test/bellseboss.png',
      alt_text: 'Bellseboss Studio',
      headline: 'Bellseboss Studio',
      body: null,
      cta_label: 'Ver más',
      target_url: 'https://bellseboss.itch.io/',
      click_url: 'http://localhost/ads/game-home_sidebar',
    },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useAdSlot', () => {
  it('carga el slot y expone las creatividades', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(slot), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useAdSlot('home_sidebar'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.slot).toEqual(slot);
    expect(result.current.error).toBeNull();
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      '/placements/home_sidebar',
    );
  });

  it('deja slot en null y expone el error cuando falla', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('nope', { status: 404 })),
    );

    const { result } = renderHook(() => useAdSlot('nope'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.slot).toBeNull();
    expect(result.current.error).toContain('404');
  });

  it('recarga cuando cambia el placement', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(slot), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const { rerender } = renderHook(({ key }) => useAdSlot(key), {
      initialProps: { key: 'home_sidebar' },
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    rerender({ key: 'product_sidebar' });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(String(fetchMock.mock.calls[1][0])).toContain(
      '/placements/product_sidebar',
    );
  });
});
