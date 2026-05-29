export type SortDirection = "asc" | "desc";

export function compareStrings(a: string, b: string, dir: SortDirection): number {
  const result = a.localeCompare(b, undefined, { sensitivity: "base" });
  return dir === "asc" ? result : -result;
}

export function sortByKey<T>(
  items: T[],
  getKey: (item: T) => string,
  dir: SortDirection
): T[] {
  return [...items].sort((a, b) => compareStrings(getKey(a), getKey(b), dir));
}

export function sortByNumber<T>(
  items: T[],
  getNum: (item: T) => number,
  dir: SortDirection
): T[] {
  return [...items].sort((a, b) => {
    const diff = getNum(a) - getNum(b);
    return dir === "asc" ? diff : -diff;
  });
}
