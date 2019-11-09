export interface DescriptionObject {
  [key: string]: { name: string; text: string };
}

export const parameterDescriptions: DescriptionObject = {
  theta: {
    name: "Hatch Tribute",
    text:
      "The percentage of the funds raised during the Hatch that goes directly to Funding Pool to be used to support the Commons' mission, the rest goes to the collateral pool"
  },
  p0: {
    name: "Hatch price",
    text: "The price paid per token by when hatching the Commons"
  },
  p1: {
    name: "Post-Hatch price",
    text:
      "The price per token at the launch of the Commons when the curve is set and anyone can join with the Commons"
  },
  wFee: {
    name: "Exit Tribute",
    text:
      "The percentage that goes to the Funding Pool when token holders 'sell' by burning their token at the price determined by the ABC. If the Exit Tribute is 10% and the price is 1 DAI/token then, for every token burned, the exiting token holder would get 0.9 Dai and the Funding Pool would get 0.1 Dai"
  },
  vHalflife: {
    name: "Vesting Curve",
    text:
      "Tokens that are purchased during the Hatch are locked initially and then released slowly such that 50% of the tokens will be able to be sold after the locking period + this many weeks and 87.5% of the tokens after 3x this many weeks + the locking period. In this demo the locking period is 7 weeks"
  },
  d0: {
    name: "Hatch Raise",
    text: "Amount of funds initially contributed before the launch of the Commons, this variable helps shape the curve"
  }
};

export const supplyVsDemandChartDescription =
  "Visualization of the bonding curve up to 4x the initial size of the Collateral Pool Post-Hatch. This result is deterministic given the parameters set. It will not change regardless of the campaign's performance, it simply shows how the price will react to changes in the Collateral Pool.";

export const simulationChartDescription =
  "This chart shows a 52 week simulation of discrete transactions interacting with the Augmented Bonding Curve. Each transaction adds to or subtracts collateral from the system, modifying the price over time. The frequency, size and direction of each transaction is computed from a set of bounded random functions. This is a NOT a cadCAD simulation, but it showcases the intention behind cadCAD.";

export const simulationParameterDescriptions: DescriptionObject = {
  price: {
    name: "Price",
    text: "Price of the token over time."
  },
  floorPrice: {
    name: "Vesting Curve",
    text:
      "Lower bound of the price guaranteed by the Vesting Curve. It decreases over time as the tokens received by Hatchers are unlocked"
  },
  totalRaised: {
    name: "Total funds raised",
    text: "Cumulative sum of the funds sent to the Funding Pool"
  }
};

export const resultParameterDescriptions: DescriptionObject = {
  totalReserve: {
    name: "Collateral Pool balance",
    text: "Total Dai in the collateral pool at the end of the simulated period"
  },
  slippage: {
    name: "Median slippage",
    text:
      "Median of change in price a user experiences from the current price of one token to the price actually received when minting or burning many tokens"
  },
  initialHatchFunds: {
    name: "Funds generated from Hatch Tribute",
    text: "Funds raised during the Hatch that go directly to the Funding Pool"
  },
  exitTributes: {
    name: "Funds generated from Exit Tributes",
    text:
      "Cumulative sum of Exit Tributes collected from tokens that are burned"
  },
  totalRaised: {
    name: "Total funds raised for your community",
    text: "Sum of funds from the Hatch Tribute + funds from Exit Tributes"
  }
};
