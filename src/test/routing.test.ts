import { describe, expect, it } from 'vitest';
import {
  authCallbackUrl,
  boardHash,
  boardHref,
  boardListHref,
  boardListUrl,
  boardUrl,
  safeRedirectTarget,
  slugFromHash,
} from '../utils/routing';

describe('boardHash', () => {
  it('addresses a board after the fragment', () => {
    expect(boardHash('my-board')).toBe('#/my-board');
  });

  it('escapes a slug so the fragment stays well-formed', () => {
    expect(boardHash('a b')).toBe('#/a%20b');
  });
});

describe('slugFromHash', () => {
  it('reads the slug back', () => {
    expect(slugFromHash('#/my-board')).toBe('my-board');
    expect(slugFromHash('#/my-board/')).toBe('my-board');
    expect(slugFromHash('my-board')).toBe('my-board');
  });

  it('returns null for the board list', () => {
    expect(slugFromHash('')).toBeNull();
    expect(slugFromHash('#')).toBeNull();
    expect(slugFromHash('#/')).toBeNull();
  });

  it('returns null for anything that is not a single clean slug', () => {
    expect(slugFromHash('#/a/b')).toBeNull();
    expect(slugFromHash('#/../etc/passwd')).toBeNull();
    expect(slugFromHash('#/has space')).toBeNull();
    expect(slugFromHash('#/has.dot')).toBeNull();
  });

  it('round-trips a hash through the slug', () => {
    for (const slug of ['roadmap', 'q1-plan', 'Board_9']) {
      expect(slugFromHash(boardHash(slug))).toBe(slug);
    }
  });
});

describe('boardUrl', () => {
  it('produces a shareable absolute URL', () => {
    expect(boardUrl('roadmap', 'https://example.com')).toBe(
      'https://example.com/#/roadmap'
    );
  });

  it('puts the fragment after the path, never inside it', () => {
    // GitHub Pages only receives the part before "#", which must be a real file.
    const url = boardUrl('roadmap', 'https://example.com/repo/');
    expect(url.split('#')[0]).toBe('https://example.com/repo/');
  });

  it('points the board list at the site root', () => {
    expect(boardListUrl('https://example.com/repo/')).toBe('https://example.com/repo/');
  });
});

describe('fragment-only hrefs', () => {
  it('keeps the path so a base-path deploy cannot break them', () => {
    // "#/x" resolves against whatever page is loaded, so the /repo prefix survives.
    expect(boardHref('roadmap')).toBe('#/roadmap');
    expect(boardListHref()).toBe('#/');
  });

  it('produces hrefs the slug parser accepts', () => {
    expect(slugFromHash(boardHref('roadmap'))).toBe('roadmap');
    expect(slugFromHash(boardListHref())).toBeNull();
  });
});

describe('safeRedirectTarget', () => {
  it('accepts a board-list or single-board hash', () => {
    expect(safeRedirectTarget('#/roadmap')).toBe('#/roadmap');
    expect(safeRedirectTarget('roadmap')).toBe('#/roadmap');
    expect(safeRedirectTarget('#/')).toBe('#/');
  });

  it('falls back to the board list for anything else', () => {
    expect(safeRedirectTarget(null)).toBe('#/');
    expect(safeRedirectTarget(undefined)).toBe('#/');
    expect(safeRedirectTarget('')).toBe('#/');
    expect(safeRedirectTarget('https://evil.example')).toBe('#/');
    expect(safeRedirectTarget('//evil.example')).toBe('#/');
    expect(safeRedirectTarget('/admin/secret')).toBe('#/');
  });
});

describe('authCallbackUrl', () => {
  it('points at the static callback route and encodes the destination', () => {
    expect(authCallbackUrl('#/roadmap', 'https://example.com')).toBe(
      'https://example.com/auth/callback?next=%23%2Froadmap'
    );
  });
});