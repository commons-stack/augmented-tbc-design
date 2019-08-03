import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { getLinspaceTicks } from "./utils";
import { useTheme } from "@material-ui/styles";

function SupplyVsDemandChart({
  returnF,
  theta,
  d0,
  p0
}: {
  returnF: number;
  theta: number;
  d0: number;
  p0: number;
}) {
  // d0      - Initial raise, d0 (DAI)
  // theta   - fraction allocated to reserve (.)
  // p0      - Hatch sale Price p0 (DAI / token)
  // returnF - Return factor (.)
  // wFee    - friction coefficient (.)

  // Hatch parameters
  const k = returnF / (1 - theta); // Invariant power kappa (.)
  const R0 = (1 - theta / 100) * d0; // Initial reserve (DAI)
  const S0 = d0 / p0; // initial supply of tokens (token)
  const S_of_R = (R: number) => S0 * (R / R0) ** (1 / k);

  // Function setup
  const f = S_of_R;
  const from = 0;
  const to = 4 * R0;
  const steps = 100;
  const step = (to - from) / steps;

  /**
   * Prettify the result converting 1000000 to 1M
   */
  const biggest = Math.max(to, f(to));
  const [scaling, unit] =
    // Billion
    biggest > 0.5e9
      ? [1e9, "B"]
      : // Million
      biggest > 0.5e6
      ? [1e6, "M"]
      : // 1 thousand
      biggest > 0.5e3
      ? [1e3, "K"]
      : // No scale
        [1, ""];

  const keyHorizontal = "x";
  const keyVertical = "Supply (tokens) / Reserve (DAI)";

  const data = [];
  for (let x = from; x <= to; x += step) {
    data.push({
      [keyHorizontal]: x,
      [keyVertical]: f(x)
    });
  }

  // Chart components

  const theme: any = useTheme();

  const formatter = (n: number) =>
    (+(n / scaling).toPrecision(2)).toLocaleString();

  function renderColorfulLegendText(value: string) {
    return <span style={{ color: theme.palette.text.secondary }}>{value}</span>;
  }

  function ReferenceLabel(props: any) {
    const { textAnchor, viewBox } = props;
    return (
      <text
        x={viewBox.x + 10}
        y={30}
        fill={theme.palette.text.secondary}
        textAnchor={textAnchor}
      >
        Initial value
      </text>
    );
  }

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
          interval={"preserveStartEnd"}
          ticks={getLinspaceTicks(data.map(d => d[keyHorizontal]), 4)}
          dataKey={keyHorizontal}
          tickFormatter={formatter}
          unit={unit}
          tick={{ fill: theme.palette.text.secondary }}
          stroke={theme.palette.text.secondary}
        />
        <YAxis
          interval={"preserveStartEnd"}
          ticks={getLinspaceTicks(data.map(d => d[keyVertical]), 3)}
          tickFormatter={formatter}
          unit={unit}
          tick={{ fill: theme.palette.text.secondary }}
          domain={[0, f(to)]}
          stroke={theme.palette.text.secondary}
        />
        <Tooltip formatter={value => formatter(Number(value))} />
        <Area
          isAnimationActive={false}
          type="monotone"
          dataKey={keyVertical}
          stroke={theme.palette.primary.main}
          fill={theme.palette.primary.main}
        />
        <ReferenceLine
          x={R0}
          stroke="#90a4ae"
          strokeDasharray="9 0"
          label={<ReferenceLabel />}
        />
        <Legend formatter={renderColorfulLegendText} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default SupplyVsDemandChart;
