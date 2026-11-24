import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('une los nombres de clase recibidos', () => {
    expect(cn('px-2', 'text-sm')).toBe('px-2 text-sm');
  });

  it('ignora valores falsy', () => {
    expect(cn('px-2', false, null, undefined, '')).toBe('px-2');
  });

  it('resuelve conflictos de Tailwind quedándose con el último', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('soporta arrays y objetos condicionales', () => {
    expect(cn(['px-2'], { 'text-sm': true, hidden: false })).toBe(
      'px-2 text-sm',
    );
  });
});
