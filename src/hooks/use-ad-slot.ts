import { useEffect, useState } from 'react';

import { fetchAdSlot } from '@/lib/ads';
import type { AdSlotResponse } from '@/types';

export interface UseAdSlotResult {
  slot: AdSlotResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Trae las creatividades del slot pedido.
 *
 * `creatives: []` es una respuesta válida (no hay campaña activa), por eso el
 * estado de error se reserva para fallas de red o respuestas inválidas.
 */
export function useAdSlot(placementKey: string): UseAdSlotResult {
  const [slot, setSlot] = useState<AdSlotResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);
    setSlot(null);

    fetchAdSlot(placementKey, controller.signal)
      .then((data) => {
        if (active) setSlot(data);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        if (cause instanceof Error && cause.name === 'AbortError') return;

        setError(
          cause instanceof Error
            ? cause.message
            : 'No se pudo cargar la publicidad.',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [placementKey]);

  return { slot, loading, error };
}
