import { getAvg } from "./utils";

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
  returnF
}: {
  d0: number;
  theta: number;
  p0: number;
  returnF: number;
}) {
  const k = returnF / (1 - theta); // Invariant power kappa (.)
  const R0 = (1 - theta) * d0; // Initial reserve (DAI)
  const S0 = d0 / p0; // initial supply of tokens (token)
  const V0 = S0 ** k / R0; // invariant coef
  return { k, R0, S0, V0 };
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

/**
 * Generate a random delta given three components:
 * 1. Climbing sin
 * 2. Oscilating sin
 * 3. Random component
 */
export function getRandomDeltas({
  numSteps,
  avgTxSize
}: {
  numSteps: number;
  avgTxSize: number;
}) {
  const deltaR_t: number[] = [];
  for (let i = 0; i < numSteps; i++) {
    const rand = 1 - 2 * Math.random();
    const sin = Math.sin((1 / 20) * (i / numSteps));
    const ascending = Math.sin((Math.PI / 1) * (i / numSteps));
    const deltaR = 1e5 * rand + 1e5 * sin + 2e4 * ascending;
    deltaR_t.push(deltaR);
  }

  // Normalize random deltas with the average transaction size
  const deltaR_avg = getAvg(deltaR_t);
  return deltaR_t.map((deltaR: number) => (avgTxSize * deltaR) / deltaR_avg);
}
