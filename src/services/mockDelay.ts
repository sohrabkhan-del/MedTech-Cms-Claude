/**
 * Simulates network latency for mock service calls so loading states (and
 * their skeleton shimmers) are actually visible during local/demo use.
 * Swap the underlying service call for a real apiClient request to drop this.
 */
export function mockDelay<T>(value: T, ms = 700): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}
