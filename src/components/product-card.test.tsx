import { describe, expect, it, vi } from 'vitest';

import type { Product } from '@/types';
import { renderWithUser, screen } from '@/test/utils';

import { ProductCard } from './product-card';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/router', () => ({
  useRouter: () => ({
    push,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
    isReady: true,
    isFallback: false,
    isLocaleDomain: false,
    isPreview: false,
    events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
  }),
}));

const product: Product = {
  id: '42',
  title: 'Pack de prueba',
  description: 'Una descripción',
  imageUrl: '',
  category: 'onlyfans',
  productType: 'standard',
  tagsString: 'onlyfans- latina -',
};

describe('<ProductCard />', () => {
  it('muestra el título y la descripción', () => {
    renderWithUser(<ProductCard product={product} />);

    expect(screen.getByText('Pack de prueba')).toBeInTheDocument();
    expect(screen.getByText('Una descripción')).toBeInTheDocument();
  });

  it('enlaza al detalle con el id del producto', () => {
    renderWithUser(<ProductCard product={product} />);

    expect(
      screen.getByRole('link', { name: /pack de prueba/i }),
    ).toHaveAttribute('href', '/products/detail?id=42');
  });

  it('muestra el fallback cuando no hay imagen', () => {
    renderWithUser(<ProductCard product={product} />);

    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('navega al buscador al hacer click en un tag, sin seguir el link', async () => {
    const { user } = renderWithUser(<ProductCard product={product} />);

    await user.click(screen.getByText('latina'));

    expect(push).toHaveBeenCalledWith('/search/tag?tag=latina');
  });
});
