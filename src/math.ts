/**
 * Computes the initial params given the "user friendly" params:
 * - Initial raise, `d0` (DAI)
 * - fraction allocated to reserve, `theta`
 * - Hatch sale price, `p0` (DAI / token)
 * - Return factor, `returnF`
 */
export function getInitialParams({
  d0,
  theta,
  p0,
  p1
}: {
  d0: number;
  theta: number;
  p0: number;
  p1: number;
}) {
  const k = p1 / p0 / (1 - theta); // Invariant power kappa (.)
  const R0 = (1 - theta) * d0; // Initial reserve (DAI)
  const S0 = d0 / p0; // initial supply of tokens (token)
  const V0 = S0 ** k / R0; // invariant coef
  return { k, R0, S0, V0 };
}

function getR({ S, V0, k }: { S: number; V0: number; k: number }) {
  return S ** k / V0;
}

export function getS({ R, V0, k }: { R: number; V0: number; k: number }) {
  return (V0 * R) ** (1 / k);
}

// compute the reserve if all that supply is burned
export function getMinR({
  S,
  H,
  V0,
  k
}: {
  S: number;
  H: number;
  V0: number;
  k: number;
}) {
  return getR({ S: S - H, V0, k });
}

// compute the price if all that supply is burned
export function getMinPrice({
  S,
  H,
  V0,
  k
}: {
  S: number;
  H: number;
  V0: number;
  k: number;
}) {
  if (S === H) {
    const myR = getR({ S, V0, k });
    const myP = getPriceR({ R: myR, V0, k }); // numerical precision make complex numbers just suppress it
    return Math.abs(myP);
  } else {
    const minR = getMinR({ S, H, V0, k });
    return getPriceR({ R: minR, V0, k });
  }
}

/**
 * Computes the price at a specific reserve `R`
 */
export function getPriceR({ R, V0, k }: { R: number; V0: number; k: number }) {
  return (k * R ** ((k - 1) / k)) / V0 ** (1 / k);
}

/**
 * Compute slippage at a point `R`, given a `deltaR`
 */
export function getSlippage({
  R,
  deltaR,
  V0,
  k
}: {
  R: number;
  deltaR: number;
  V0: number;
  k: number;
}) {
  const S = (V0 * R) ** (1 / k);
  const deltaS = (V0 * (R + deltaR)) ** (1 / k) - S;
  const realizedPrice = deltaR / deltaS;
  const spotPrice = getPriceR({ R, V0, k });
  return Math.abs(realizedPrice - spotPrice) / spotPrice;
}

// Price walk utils

/**
 * Get deltaR for a given price growth factor
 */
export function getDeltaR_priceGrowth({
  R,
  k,
  priceGrowth
}: {
  R: number;
  k: number;
  priceGrowth: number;
}) {
  return -R + (priceGrowth * R ** (1 - 1 / k)) ** (k / (-1 + k));
}

/**
 * Computes a tx distribution using a normal distribution,
 * Given a sum of tx value and a number of transactions
 *
 * Demo: https://codepen.io/anon/pen/mNqJjv?editors=0010#0
 * Very quick: < 10ms for 10000 txs
 */
export function getTxDistribution({
  sum,
  num,
  spread
}: {
  sum: number;
  num: number;
  spread: number;
}) {
  const mean = sum / num;
  const off = mean * spread;
  const x: number[] = [];
  for (let i = 0; i < num; i++) {
    x.push(randn_bm(mean - off, mean + off));
  }
  return x;
}

export function vest_tokens({
  week,
  H, // unvested_hatch_tokens
  halflife,
  cliff
}: {
  week: number;
  H: number;
  halflife: number;
  cliff: number;
}) {
  // check cliff
  if (week < cliff) {
    return 0;
  } else {
    // rate of release given half - life
    const vest_fraction = 0.5 ** (1 / halflife);
    // number of tokens that vest in this week
    return H * (1 - vest_fraction);
  }
}

// Statistics utils

/**
 * Random variable uniformly distributed
 */
export function rv_U(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/**
 * Standard Normal variate using Box-Muller transform.
 * by https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve/36481059#36481059
 */
function randn_bm(min: number, max: number) {
  var u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) num = randn_bm(min, max); // resample between 0 and 1 if out of range
  num *= max - min; // Stretch to fill range
  num += min; // offset to min
  return num;
}

// Array utils

export function getMedian(arr: number[]) {
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

export function getSum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}
