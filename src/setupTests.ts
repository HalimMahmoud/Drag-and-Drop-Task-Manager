import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/components/AuthProvider';

// Mock Supabase environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test_anon_key';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' },
};

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      }),
      onAuthStateChange: vi.fn((callback) => {
        callback('SIGNED_IN', { user: mockUser });
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}));

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