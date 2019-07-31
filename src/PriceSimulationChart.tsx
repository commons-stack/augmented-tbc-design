import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const grayColor = "#90a4ae";
const strongColor = "#4ab47c";
const strongOpositeColor = "#b44a9b";

function PriceSimulationChart({
  priceTimeseries,
  withdrawFeeTimeseries,
  p0
}: {
  priceTimeseries: number[];
  withdrawFeeTimeseries: number[];
  p0: number;
}) {
  // d0      - Initial raise, d0 (DAI)
  // theta   - fraction allocated to reserve (.)
  // p0      - Hatch sale Price p0 (DAI / token)
  // returnF - Return factor (.)
  // wFee    - friction coefficient (.)

  const keyHorizontal = "x";
  const keyVerticalLeft = "Price (DAI / token)";
  const keyVerticalRight = "Collected withdraw fee (DAI)";

  const data = [];
  for (let t = 0; t < priceTimeseries.length; t++) {
    data.push({
      [keyHorizontal]: t,
      [keyVerticalLeft]: priceTimeseries[t] || 0,
      [keyVerticalRight]: withdrawFeeTimeseries[t] || 0
    });
  }

  function renderColorfulLegendText(value: string) {
    return <span style={{ color: grayColor }}>{value}</span>;
  }

  const formatter = (n: number) => (+n.toPrecision(3)).toLocaleString();

  return (
    <ResponsiveContainer debounce={1}>
      <AreaChart
        width={0}
        height={400}
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={keyHorizontal}
          tick={{ fill: grayColor }}
          stroke={grayColor}
        />
        <YAxis
          yAxisId="left"
          domain={[Math.min(...priceTimeseries), Math.max(...priceTimeseries)]}
          tickFormatter={formatter}
          tick={{ fill: grayColor }}
          stroke={grayColor}
        />

        {/* Capital collected from withdraw fees - AXIS */}
        <YAxis
          yAxisId="right"
          // domain={[
          //   Math.floor(Math.min(...withdrawFeeTimeseries)),
          //   Math.ceil(Math.max(...withdrawFeeTimeseries))
          // ]}
          orientation="right"
          tick={{ fill: grayColor }}
          stroke={grayColor}
        />

        <Tooltip formatter={value => Number(value)} />
        <Area
          isAnimationActive={false}
          yAxisId="left"
          type="monotone"
          dataKey={keyVerticalLeft}
          stroke={strongColor}
          fill={strongColor}
        />

        {/* Capital collected from withdraw fees - AREA */}
        <Area
          isAnimationActive={false}
          yAxisId="right"
          type="monotone"
          dataKey={keyVerticalRight}
          stroke={strongOpositeColor}
          fill={strongOpositeColor}
        />

        {/* <ReferenceLine
          x={R0}
          stroke="#90a4ae"
          strokeDasharray="6 3"
          label={<ReferenceLabel />}
        /> */}
        <Legend formatter={renderColorfulLegendText} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default PriceSimulationChart;
