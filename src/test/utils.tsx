import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';

export * from '@testing-library/react';

/**
 * Render + user-event en un solo paso.
 *
 * `userEvent.setup()` debe llamarse antes del render para que los eventos
 * usen el `document` correcto y respeten `pointer-events` de jsdom.
 */
export function renderWithUser(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'>,
) {
  const user = userEvent.setup();
  return { user, ...render(ui, options) };
}
