export interface DescriptionObject {
  [key: string]: { name: string; text: string };
}

export const parameterDescriptions: DescriptionObject = {
  theta: {
    name: "Hatch Raise % to funding pool",
    text:
      "The percentage of the funds raised in the Hatch going directly to funding pool to be used to support the Commons, the rest goes to the collateral pool"
  },
  p0: {
    name: "Hatch price",
    text: "The price paid per token by when hatching the project"
  },
  p1: {
    name: "Post-Hatch price",
    text:
      "The price per token after the Hatch ends, the curve is set, and anyone can interact with the bonding curve"
  },
  wFee: {
    name: "Exit tribute",
    text:
      "The percentage that goes to the funding pool when token holders 'sell' by burning their token at the price determined by the bonding curve"
  },
  vHalflife: {
    name: "Vesting half-life",
    text:
      "Tokens that are purchased during the Hatch are locked for 8 weeks and then released slowly such that 50% of the tokens will be able to be sold after this many weeks and 87.5% of the tokens after 3x this many weeks"
  },
  d0: {
    name: "Hatch Raise",
    text: "Amount of funds contributed during the hatch period"
  }
};

export const supplyVsDemandChartDescription =
  "Visualization of the bonding curve up to 4x the initial size of the Collateral Pool Post-Hatch. This result is deterministic given the curve parameters and the Hatch raise. It will never change regardless of the campaign's performance, it simply shows how the price will react to changes in the Collateral Pool.";

export const simulationChartDescription =
  "This chart shows a 52 week simulation of discrete transactions interacting with the Augmented Bonding Curve. Each transaction adds to or subtracts reserve from the system, modifying the price over time. The frequency, size and direction of each transaction is computed from a set of bounded random functions. This is a NOT a cadCAD simulation, but it showcases the intention behind cadCAD.";

export const simulationParameterDescriptions: DescriptionObject = {
  price: {
    name: "Price",
    text: "Price of the token over time."
  },
  floorPrice: {
    name: "Floor price",
    text:
      "Lower bound of the price guaranteed by the vesting of hatch tokens. It decreases over time as more hatch tokens are allowed to be traded"
  },
  totalRaised: {
    name: "Total funds raised",
    text: "Cumulative sum of the funds sent to the Funding Pool"
  }
};

export const resultParameterDescriptions: DescriptionObject = {
  totalReserve: {
    name: "Collateral pool balance",
    text: "Total DAI in the collateral pool at the end of the simulated period"
  },
  initialHatchFunds: {
    name: "Funds generated from Raise Hatch",
    text: "Funds raised during the Hatch that go directly to the cause"
  },
  exitTributes: {
    name: "Funds generated from exit tributes",
    text:
      "Cumulative sum of exit tributes collected from only exit / sell / burn transactions"
  },
  slippage: {
    name: "Median slippage",
    text:
      "Median of change in price a user experiences from the current price to the price received for exiting/selling/burning"
  }
};
