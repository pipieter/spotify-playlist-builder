export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
export function arrayToMap<T>(
  items: T[],
  field: keyof T
): Map<string | number, T> {
  const result: Map<string | number, T> = new Map();
  items.forEach((item) => {
    const index = item[field] as string | number;
    result.set(index, item);
  });
  return result;
}

export function mapToArray<T>(map: Map<unknown, T>): T[] {
  return Array.from(map.values());
}

export function msToTime(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const hours_str = hours < 10 ? "0" + hours : hours;
  const minutes_str = minutes < 10 ? "0" + minutes : minutes;
  const seconds_str = seconds < 10 ? "0" + seconds : seconds;

  return hours_str + ":" + minutes_str + ":" + seconds_str;
}

export function formatDateString(date: Date): string {
  function prependZero(value: number): string {
    if (value < 10) return `0${value}`;
    return `${value}`;
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear() % 2000;

  return `${prependZero(day)}/${prependZero(month)}/${prependZero(year)}`;
}
