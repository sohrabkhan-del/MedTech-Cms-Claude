export const env = {
  /** In production this is empty so requests go through Netlify's same-origin
   *  `/api/*` proxy (see `public/_redirects`) — the backend is plain HTTP and
   *  would otherwise be blocked as mixed content on an HTTPS-served site. */
  apiBaseUrl: import.meta.env.PROD
    ? ''
    : (import.meta.env.VITE_API_BASE_URL ?? 'https://zd02x6zk-3337.inc1.devtunnels.ms'),
} as const
