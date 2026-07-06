/**
 * Base-path-safe public asset URLs. In dev BASE_URL is "/", on GitHub Pages
 * it's "/<repo>/" — absolute "/assets/…" strings would 404 there.
 */
export const asset = (path: string) =>
  import.meta.env.BASE_URL + path.replace(/^\//, "");
