// Turns an array of T into a Record<string | number | symbol, T>

export function keyBy<T extends object>(collection: T[], func: (item: T) => string | number | symbol): Record<string, T> {
  return Object.fromEntries(collection.map(i => [func(i), i]));
}