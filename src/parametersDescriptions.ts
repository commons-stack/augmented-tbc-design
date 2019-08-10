export interface DescriptionObject {
  [key: string]: { name: string; text: string };
}

export const parameterDescriptions: DescriptionObject = {
  theta: {
    name: "Allocation to funding pool",
    text:
      "The percentage of the funds raised in the Hatch sale that go directly into the project funding pool to compensate future work done in the project"
  },
  p0: {
    name: "Hatch price",
    text:
      "The price paid per 'ABC token' by community members involved in hatching the project"
  },
  p1: {
    name: "Post-hatch price",
    text:
      "The price of the 'ABC token' when the curve enters the open phase and is live for public participation"
  },
  wFee: {
    name: "Exit tribute",
    text:
      "The percentage of funds that are diverted to the project funding pool from community members who exit funds from the project by burning 'ABC tokens' in exchange for collateral"
  },
  d0: {
    name: "Initial raise",
    text: "Total funds raised in the hatch period of the ABC launch"
  }
};

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
  exitTributes: {
    name: "Total exit tributes",
    text:
      "Cumulative sum of exit tributes collected from only exit /sell transactions"
  }
};

export const resultParameterDescriptions: DescriptionObject = {
  totalReserve: {
    name: "Total reserve",
    text:
      "Total DAI in the smart contract reserve at the end of the simulated period"
  },
  initialHatchFunds: {
    name: "Funds generated from initial hatch",
    text:
      "Fraction of the funds (theta) raised during the hatch that go directly to the cause (analytic result)"
  },
  exitTributes: {
    name: "Funds generated from exit tributes",
    text: simulationParameterDescriptions.exitTributes.text
  },
  slippage: {
    name: "Average slippage",
    text:
      "Average of the slippage of each transaction occured during the simulation period"
  }
};
