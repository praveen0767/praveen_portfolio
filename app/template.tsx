/**
 * Route transition surface.
 *
 * A `template` is remounted on every navigation while `layout` persists, which
 * makes it the App Router's hook for a per-navigation entrance. The animation
 * itself is pure CSS on `.page-enter`, so it costs no JavaScript and is skipped
 * entirely under `prefers-reduced-motion` (see the reduced-motion block in
 * globals.css).
 *
 * There is deliberately no exit animation: the outgoing tree is unmounted before
 * it can be transitioned, so an exit would need a client-side transition cache
 * and would delay every navigation.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}