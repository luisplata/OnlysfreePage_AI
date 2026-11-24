import { describe, expect, it, vi } from 'vitest';

import { renderWithUser, screen } from '@/test/utils';

import { Button } from './button';

describe('<Button />', () => {
  it('renderiza su contenido', () => {
    renderWithUser(<Button>Guardar</Button>);

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('dispara onClick al hacer click', async () => {
    const onClick = vi.fn();
    const { user } = renderWithUser(<Button onClick={onClick}>Enviar</Button>);

    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('no dispara onClick cuando está deshabilitado', async () => {
    const onClick = vi.fn();
    const { user } = renderWithUser(
      <Button onClick={onClick} disabled>
        Enviar
      </Button>,
    );

    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('delega en el hijo cuando usa asChild', () => {
    renderWithUser(
      <Button asChild>
        <a href="/productos">Ir a productos</a>
      </Button>,
    );

    expect(
      screen.getByRole('link', { name: 'Ir a productos' }),
    ).toHaveAttribute('href', '/productos');
  });
});
