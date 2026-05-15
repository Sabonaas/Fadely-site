/**
 * Redireciona para login com retorno opcional (path interno, ex. /dashboard).
 */
export function goToLogin(nextPath = '/') {
  const q = new URLSearchParams();
  if (nextPath && nextPath !== '/') q.set('next', nextPath);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  window.location.assign(`/login${suffix}`);
}
