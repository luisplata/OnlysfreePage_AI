import * as React from 'react';
import Image from 'next/image';

import { useAdImpression } from '@/hooks/use-ad-impression';
import type { AdCreative } from '@/types';

export interface AdCreativeCardProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  creative: AdCreative;
  placementKey: string;
}

/**
 * Una creatividad de publicidad.
 *
 * - El `href` es `click_url` (registra el click y redirige), no `target_url`.
 * - `alt_text` cae a `headline` y luego a `name`.
 * - `body` y `cta_label` solo se renderizan si vienen.
 * - Reporta impresión con el hook (≥50% visible por 1s).
 */
export const AdCreativeCard = React.forwardRef<
  HTMLAnchorElement,
  AdCreativeCardProps
>(function AdCreativeCard(
  { creative, placementKey, ...props },
  forwardedRef,
) {
  const impressionRef = useAdImpression<HTMLAnchorElement>({
    creativeKey: creative.campaign_key,
    placementKey,
    enabled: Boolean(creative.click_url && creative.image_url),
  });

  const { image_url, alt_text, headline, body, cta_label, click_url, name } =
    creative;

  const setRef = (node: HTMLAnchorElement | null) => {
    impressionRef.current = node;

    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  // Sin imagen o sin URL de click no hay nada útil que mostrar.
  if (!image_url || !click_url) {
    return null;
  }

  const alt = alt_text || headline || name || 'Publicidad';
  const title = headline || name;

  return (
    <a
      ref={setRef}
      href={click_url}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7">
        <Image
          src={image_url}
          alt={alt}
          fill
          sizes="(max-width: 256px) 100vw, 200px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(event) => {
            (event.target as HTMLImageElement).src =
              'https://placehold.co/200x112.png?text=Ad+Error';
            (event.target as HTMLImageElement).srcset = '';
          }}
        />
      </div>
      {title ? (
        <span className="mt-1 text-xs font-medium group-data-[collapsible=icon]:hidden">
          {title}
        </span>
      ) : null}
      {body ? (
        <span className="line-clamp-1 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          {body}
        </span>
      ) : null}
      {cta_label ? (
        <span className="text-[10px] font-medium text-primary group-data-[collapsible=icon]:hidden">
          {cta_label}
        </span>
      ) : null}
    </a>
  );
});
