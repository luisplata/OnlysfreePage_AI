import { describe, expect, it, vi } from 'vitest';

import { renderWithUser, screen } from '@/test/utils';
import type { AdCreative } from '@/types';

import { AdCreativeCard } from './ad-creative-card';

// next/image no corre fuera del compilador de Next; lo reducimos a un <img>.
vi.mock('next/image', async () => {
  const React = await import('react');
  return {
    default: ({ fill, priority, ...props }: Record<string, unknown>) =>
      React.createElement('img', props),
  };
});

const creative: AdCreative = {
  campaign_key: 'game-home_sidebar',
  name: 'Bellseboss Studio',
  image_url: 'https://cdn.test/bellseboss.png',
  alt_text: 'Bellseboss Studio',
  headline: 'Bellseboss Studio',
  body: 'Videojuegos independientes',
  cta_label: 'Ver más',
  target_url: 'https://bellseboss.itch.io/',
  click_url: 'http://localhost/ads/game-home_sidebar',
};

function renderCard(overrides: Partial<AdCreative> = {}) {
  return renderWithUser(
    <AdCreativeCard
      creative={{ ...creative, ...overrides }}
      placementKey="home_sidebar"
    />,
  );
}

describe('<AdCreativeCard />', () => {
  it('muestra la imagen con alt_text', () => {
    renderCard();

    expect(screen.getByAltText('Bellseboss Studio')).toHaveAttribute(
      'src',
      'https://cdn.test/bellseboss.png',
    );
  });

  it('usa headline como alt si alt_text viene vacío', () => {
    renderCard({ alt_text: null });

    expect(screen.getByAltText('Bellseboss Studio')).toBeInTheDocument();
  });

  it('enlaza a click_url, no a target_url', () => {
    renderCard();

    const link = screen.getByRole('link', { name: /bellseboss studio/i });

    expect(link).toHaveAttribute('href', 'http://localhost/ads/game-home_sidebar');
    expect(link).not.toHaveAttribute('href', 'https://bellseboss.itch.io/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('muestra headline, body y cta cuando vienen', () => {
    renderCard();

    expect(screen.getByText('Bellseboss Studio')).toBeInTheDocument();
    expect(screen.getByText('Videojuegos independientes')).toBeInTheDocument();
    expect(screen.getByText('Ver más')).toBeInTheDocument();
  });

  it('oculta body y cta cuando vienen null', () => {
    renderCard({ body: null, cta_label: null });

    expect(screen.queryByText('Videojuegos independientes')).not.toBeInTheDocument();
    expect(screen.queryByText('Ver más')).not.toBeInTheDocument();
  });

  it('no renderiza nada si falta click_url o image_url', () => {
    const { container } = renderCard({ click_url: '' });
    const { container: container2 } = renderCard({ image_url: '' });

    expect(container).toBeEmptyDOMElement();
    expect(container2).toBeEmptyDOMElement();
  });
});
