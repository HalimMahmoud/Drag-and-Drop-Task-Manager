import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/components/AuthProvider';

afterEach(() => cleanup());

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  draggable: vi.fn(() => () => {}),
  dropTargetForElements: vi.fn(() => () => {}),
  monitorForElements: vi.fn(() => () => {}),
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop/combine', () => ({
  combine: (...cleanups: (() => void)[]) => () => cleanups.forEach((cleanup) => cleanup?.()),
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge', () => ({
  attachClosestEdge: vi.fn((data: unknown) => data),
  extractClosestEdge: vi.fn(() => null),
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash', () => ({
  triggerPostMoveFlash: vi.fn(),
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop-live-region', () => ({
  announce: vi.fn(),
  cleanup: vi.fn(),
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index', () => ({
  getReorderDestinationIndex: vi.fn(
    ({ startIndex, indexOfTarget, closestEdgeOfTarget }: { startIndex: number; indexOfTarget: number; closestEdgeOfTarget: 'top' | 'bottom' | null }) =>
      closestEdgeOfTarget === 'bottom' ? Math.max(startIndex, indexOfTarget + 1) : indexOfTarget,
  ),
}));

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Custom render with AuthProvider
const customRender = (ui: ReactNode, options?: Omit<RenderOptions, 'wrapper'>) => {
  return render(ui, { wrapper: AuthProvider, ...options });
};

export * from '@testing-library/react';
export { customRender as render };