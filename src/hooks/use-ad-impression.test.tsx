import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdImpression } from './use-ad-impression';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  callback: IntersectionObserverCallback;
  elements: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(element: Element) {
    this.elements.push(element);
  }

  unobserve() {}

  disconnect() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(ratio: number) {
    this.callback(
      [
        {
          intersectionRatio: ratio,
          isIntersecting: ratio >= 0.5,
          target: this.elements[0],
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

function Probe({ dwellMs = 1000 }: { dwellMs?: number }) {
  const ref = useAdImpression<HTMLAnchorElement>({
    creativeKey: 'game-home_sidebar',
    placementKey: 'home_sidebar',
    dwellMs,
  });

  return (
    <a ref={ref} href="http://localhost/ads/game-home_sidebar">
      Anuncio
    </a>
  );
}

let beacon: ReturnType<typeof vi.fn>;

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  beacon = vi.fn().mockReturnValue(true);
  Object.defineProperty(navigator, 'sendBeacon', {
    value: beacon,
    configurable: true,
    writable: true,
  });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  Object.defineProperty(navigator, 'sendBeacon', {
    value: undefined,
    configurable: true,
    writable: true,
  });
});

function currentObserver() {
  const observer = MockIntersectionObserver.instances.at(-1);
  if (!observer) throw new Error('No IntersectionObserver was created');
  return observer;
}

describe('useAdImpression', () => {
  it('cuenta recién después de 1000 ms con el anuncio ≥50% visible', () => {
    render(<Probe />);

    act(() => currentObserver().trigger(0.6));
    act(() => vi.advanceTimersByTime(999));
    expect(beacon).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));

    expect(beacon).toHaveBeenCalledTimes(1);
    expect(String(beacon.mock.calls[0][0])).toContain('/ads/impression');
  });

  it('no cuenta si baja del 50% antes de completar el tiempo', () => {
    render(<Probe />);

    act(() => currentObserver().trigger(0.6));
    act(() => vi.advanceTimersByTime(600));
    act(() => currentObserver().trigger(0.2));
    act(() => vi.advanceTimersByTime(2000));

    expect(beacon).not.toHaveBeenCalled();
  });

  it('no cuenta si el anuncio queda por debajo del 50%', () => {
    render(<Probe />);

    act(() => currentObserver().trigger(0.49));
    act(() => vi.advanceTimersByTime(2000));

    expect(beacon).not.toHaveBeenCalled();
  });

  it('reporta una sola impresión por montaje', () => {
    render(<Probe />);

    act(() => currentObserver().trigger(0.8));
    act(() => vi.advanceTimersByTime(1000));
    act(() => currentObserver().trigger(0.8));
    act(() => vi.advanceTimersByTime(2000));

    expect(beacon).toHaveBeenCalledTimes(1);
  });

  it('respeta un dwell personalizado', () => {
    render(<Probe dwellMs={50} />);

    act(() => currentObserver().trigger(0.8));
    act(() => vi.advanceTimersByTime(49));
    expect(beacon).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(beacon).toHaveBeenCalledTimes(1);
  });
});
