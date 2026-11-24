import * as React from 'react';

import { sendAdImpression } from '@/lib/ads';

export interface UseAdImpressionOptions {
  creativeKey: string;
  placementKey: string;
  /** Permite desactivar el tracking (p. ej. si faltan datos del anuncio). */
  enabled?: boolean;
  /** Tiempo continuo visible exigido por el contrato. */
  dwellMs?: number;
}

/**
 * Reporta una impresión cuando el anuncio está ≥50% visible durante
 * `dwellMs` continuos (1000 ms por contrato).
 *
 * Una sola impresión por montaje: después de disparar, desconecta el observer.
 */
export function useAdImpression<T extends HTMLElement = HTMLElement>({
  creativeKey,
  placementKey,
  enabled = true,
  dwellMs = 1000,
}: UseAdImpressionOptions): React.MutableRefObject<T | null> {
  const ref = React.useRef<T | null>(null);
  const reported = React.useRef(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!enabled || !element || reported.current) return;
    if (typeof IntersectionObserver === 'undefined') return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let intersecting = false;

    const clearTimer = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const fire = () => {
      timer = null;
      if (reported.current) return;
      if (document.visibilityState === 'hidden') return;

      reported.current = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      sendAdImpression({ creative: creativeKey, placement: placementKey });
    };

    const arm = () => {
      if (!intersecting || reported.current || timer !== null) return;
      if (document.visibilityState === 'hidden') return;
      timer = setTimeout(fire, dwellMs);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') arm();
      else clearTimer();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        intersecting = entry.intersectionRatio >= 0.5;

        if (intersecting) arm();
        else clearTimer();
      },
      { threshold: [0, 0.5, 1] },
    );

    observer.observe(element);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearTimer();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [creativeKey, placementKey, enabled, dwellMs]);

  return ref;
}
