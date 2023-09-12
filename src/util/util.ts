export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return !(value === null || value === undefined);
}

export function count<T>(array: T[], value: T) {
  return array.filter((entry) => entry === value).length;
}

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
