/**
 * Resolves a public asset path against Vite's base URL (import.meta.env.BASE_URL).
 * Ensures correct asset resolution whether deployed at root ('/') or under a subpath ('/portfolio/').
 *
 * @param path - Root-relative path (e.g. '/center.webp' or 'resume.pdf')
 * @returns Fully qualified base-safe asset URL
 */
export function assetUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${cleanPath}`;
}
