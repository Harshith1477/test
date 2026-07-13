/**
 * Confirms a request's Origin (or Referer, as fallback) host matches the request's own
 * Host header. Browsers reliably send Origin on fetch POSTs, same-origin or not — a public
 * form endpoint with no auth of its own can use this to reject cross-site script submissions
 * without needing a CSRF token.
 */
export function isTrustedOrigin(req: Request): boolean {
  const host = req.headers.get("host");
  if (!host) return false;

  const candidate = req.headers.get("origin") || req.headers.get("referer");
  if (!candidate) return false;

  try {
    return new URL(candidate).host === host;
  } catch {
    return false;
  }
}
