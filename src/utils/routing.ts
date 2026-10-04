/**
 * Routing is hash-based because GitHub Pages serves static files only: there is no
 * server to resolve `/my-board`, but the fragment after `#` never reaches the network
 * and is entirely the browser's business.
 *
 *   #/            board list
 *   #/my-board    one board
 *
 * Keeping every conversion in one place means links, redirects and copy-link buttons
 * cannot drift apart.
 */

/**
 * The prefix the site is served from: `/` for a user site, or `/<repo>` for a project
 * site. `location.origin` deliberately excludes it, so every absolute URL has to add it
 * back or shared links will point at the wrong place.
 */
function basePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? '';
}

/**
 * Joins a site root and the hash route. Slashes are normalized only at the seams, so
 * the `//` in a scheme is never collapsed.
 */
function buildUrl(hash: string, origin?: string): string {
  const base = basePath().replace(/^\/+|\/+$/g, '');
  const root = (origin ?? (typeof window === 'undefined' ? '' : window.location.origin))
    .replace(/\/+$/, '');
  const prefix = base ? `${root}/${base}` : root;
  if (!hash || hash === '/' || hash === '#/') {
    return `${prefix}/`;
  }
  const cleanHash = hash.startsWith('#') ? hash : `#/${hash.replace(/^\/+/, '')}`;
  return `${prefix}/${cleanHash}`;
}

/** The route a board lives at, e.g. `#/my-board`. */
export function boardHash(slug: string): string {
  return `#/${encodeURIComponent(slug)}`;
}

/** Fragment-only href for a board. Stays on the current path, so it is base-path safe. */
export function boardHref(slug: string): string {
  return boardHash(slug);
}

/** Fragment-only href for the board list. */
export function boardListHref(): string {
  return '#/';
}

/** Absolute, shareable URL for a board, including the Pages base path. */
export function boardUrl(slug: string, origin?: string): string {
  return buildUrl(boardHash(slug), origin);
}

/** Full path with no hash fragment, which is the board list. */
export function boardListUrl(origin?: string): string {
  return buildUrl('', origin);
}

/**
 * Reads the board slug out of a hash fragment.
 * Returns null for the list route and for anything malformed, so a stray fragment
 * degrades to the board list rather than a broken board.
 */
export function slugFromHash(hash: string): string | null {
  const withoutHash = hash.replace(/^#/, '');
  const segments = withoutHash.split('/').filter(Boolean);
  if (segments.length !== 1) return null;

  const slug = decodeURIComponent(segments[0]);
  return /^[A-Za-z0-9_-]+$/.test(slug) ? slug : null;
}

/** Navigates to a board without a full page load. */
export function navigateToBoard(slug: string): void {
  window.location.hash = boardHash(slug);
}

/** Navigates back to the board list. */
export function navigateToBoardList(): void {
  window.location.hash = '';
}

/** The slug currently in the address bar, or null on the list route. */
export function currentBoardSlug(): string | null {
  if (typeof window === 'undefined') return null;
  return slugFromHash(window.location.hash);
}

/** The current route as a link target: the active board, or the list. */
export function currentHref(): string {
  if (typeof window === 'undefined') return boardListHref();
  return window.location.hash || boardListHref();
}

/**
 * Validates a post-sign-in destination supplied by a query string.
 *
 * Only the board list and single-board hashes are accepted. Anything else, including
 * a protocol-relative or absolute URL, falls back to the list so a crafted link can
 * never bounce a freshly authenticated user to another origin.
 */
export function safeRedirectTarget(raw: string | null | undefined): string {
  if (!raw) return boardListHref();

  const decoded = raw.startsWith('#') ? raw : `#${raw}`;
  const slug = slugFromHash(decoded);
  return slug ? boardHash(slug) : boardListHref();
}

/** Applies a destination produced by {@link safeRedirectTarget}. */
export function goToTarget(target: string): void {
  const destination = target.startsWith('http://') || target.startsWith('https://')
    ? target
    : buildUrl(target);
  window.location.replace(destination);
}

/** The OAuth return URL, including the base path Pages serves the app from. */
export function authCallbackUrl(next: string, origin?: string): string {
  const base = basePath().replace(/^\/+|\/+$/g, '');
  const root = (origin ?? (typeof window === 'undefined' ? '' : window.location.origin))
    .replace(/\/+$/, '');
  const prefix = base ? `${root}/${base}` : root;
  return `${prefix}/auth/callback?next=${encodeURIComponent(next)}`;
}