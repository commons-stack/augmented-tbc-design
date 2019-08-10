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
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { getLinspaceTicks } from "./utils";
import { getInitialParams, getPriceR } from "./math";
import { useTheme } from "@material-ui/styles";

const keyHorizontal = "x";
const keyVertical = "Supply (tokens) / Reserve (DAI)";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tooltip: {
      border: "1px solid #313d47",
      backgroundColor: "#384b59",
      padding: theme.spacing(1),
      color: "#c7ccd2"
    }
  })
);

function SupplyVsDemandChart({
  theta,
  d0,
  p0,
  p1
}: {
  theta: number;
  d0: number;
  p0: number;
  p1: number;
}) {
  // d0      - Initial raise, d0 (DAI)
  // theta   - fraction allocated to reserve (.)
  // p0      - Hatch sale Price p0 (DAI / token)
  // returnF - Return factor (.)
  // wFee    - friction coefficient (.)

  // Hatch parameters
  const {
    k, // Invariant power kappa (.)
    R0, // Initial reserve (DAI)
    S0, // initial supply of tokens (token)
    V0 // invariant coef
  } = getInitialParams({
    d0,
    theta,
    p0,
    p1
  });
  const R0_round = Math.round(R0);
  const S_of_R = (R: number) => S0 * (R / R0_round) ** (1 / k);

  // Function setup
  const f = S_of_R;
  const from = 0;
  const to = 4 * R0_round;
  const steps = 100 + 1; // Add 1 for the ticks to match
  const step = Math.round((to - from) / (steps - 1));

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

  const data = [];
  for (let i = 0; i < steps; i++) {
    const x = Math.round(from + step * i);
    data.push({
      [keyHorizontal]: x,
      [keyVertical]: f(x)
    });
  }

  // Chart components

  const theme: any = useTheme();
  const classes = useStyles();

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

  function CustomTooltip({ active, payload, label }: any) {
    if (active) {
      const supply = payload[0].value;
      const reserve = label;
      const price = getPriceR({ R: reserve, V0, k });
      const toolTipData: string[][] = [
        ["Supply", formatter(supply) + unit, "tokens"],
        ["Reserve", formatter(reserve) + unit, "DAI"],
        ["Price", price.toFixed(2), "DAI/token"]
      ];
      return (
        <div className={classes.tooltip}>
          <table>
            <tbody>
              {toolTipData.map(([name, value, unit]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{value}</td>
                  <td>{unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else return null;
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
          interval={24}
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
        <Tooltip content={<CustomTooltip />} />
        <Area
          isAnimationActive={false}
          type="monotone"
          dataKey={keyVertical}
          stroke={theme.palette.primary.main}
          fill={theme.palette.primary.main}
        />
        <ReferenceLine
          x={R0_round}
          stroke={theme.palette.primary.main}
          strokeDasharray="9 0"
          label={<ReferenceLabel />}
        />
        <Legend formatter={renderColorfulLegendText} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default SupplyVsDemandChart;
