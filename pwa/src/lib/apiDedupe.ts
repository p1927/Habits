/** Coalesce identical in-flight GET requests (same path) into one network call. */
const inflightGet = new Map<string, Promise<unknown>>();

export function dedupedGet<T>(path: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inflightGet.get(path);
  if (existing) return existing as Promise<T>;

  const promise = fetcher().finally(() => {
    if (inflightGet.get(path) === promise) {
      inflightGet.delete(path);
    }
  });
  inflightGet.set(path, promise);
  return promise;
}
