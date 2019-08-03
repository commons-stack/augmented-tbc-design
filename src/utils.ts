/**
 * Returns an equally spaced array of numbers `from`, `to` with `steps`.
 */
export function linspace({
  from = 0,
  to,
  steps
}: {
  from?: number;
  to: number;
  steps: number;
}) {
  const arr = [];
  for (let x = from; x <= to; x += (to - from) / steps) arr.push(x);
  return arr;
}

/**
 * Returns a uniform distribution of `num` ticks
 */
export function getLinspaceTicks(data: number[], num: number) {
  const desiredPoints = [];
  const step = (data[data.length - 1] - data[0]) / num;
  for (let x = data[0]; x < data[data.length - 1]; x += step) {
    desiredPoints.push(x);
  }
  if (desiredPoints.length < num + 1) desiredPoints.push(data[data.length - 1]);

  return desiredPoints;
}

/**
 * Returns the last element of an array
 */
export function getLast(a: number[]) {
  return a[a.length - 1];
}

/**
 * Returns the average of an array
 */
export function getAvg(a: number[]) {
  return a.reduce((t, c) => t + Math.abs(c), 0) / a.length;
}

/**
 * Waits `ms` miliseconds and resolves
 */
export function pause(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
