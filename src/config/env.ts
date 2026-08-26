export const env = {
  apiBaseUrl: import.meta.env.PROD
    ? ''
    : (import.meta.env.VITE_API_BASE_URL ??
      'https://zd02x6zk-3337.inc1.devtunnels.ms'),
} as const
// export const env = {
//   apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
// } as const
