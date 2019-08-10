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
import { useTheme } from "@material-ui/styles";
import { linspace } from "./utils";

const keyHorizontal = "x";
const keyVerticalLeft = "Price (DAI/token)";
const keyVerticalRight = "Total exit tributes (DAI)";
const keyVerticalLeft2 = "Floor price (DAI/token)";

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

function PriceSimulationChart({
  priceTimeseries,
  withdrawFeeTimeseries,
  floorpriceTimeseries,
  p0,
  p1
}: {
  priceTimeseries: number[];
  withdrawFeeTimeseries: number[];
  floorpriceTimeseries: number[];
  p0: number;
  p1: number;
}) {
  // d0      - Initial raise, d0 (DAI)
  // theta   - fraction allocated to reserve (.)
  // p0      - Hatch sale Price p0 (DAI / token)
  // returnF - Return factor (.)
  // wFee    - friction coefficient (.)

  const data = [];
  for (let t = 0; t < priceTimeseries.length; t++) {
    data.push({
      [keyHorizontal]: t,
      [keyVerticalLeft]: priceTimeseries[t] || 0,
      [keyVerticalLeft2]: floorpriceTimeseries[t] || 0,
      [keyVerticalRight]: withdrawFeeTimeseries[t] || 0
    });
  }

  // Chart components

  const theme: any = useTheme();
  const classes = useStyles();

  function renderColorfulLegendText(value: string) {
    return <span style={{ color: theme.palette.text.secondary }}>{value}</span>;
  }

  const formatter = (n: number) => (+n.toPrecision(3)).toLocaleString();

  function ReferenceLabel(props: any) {
    const { textAnchor, viewBox, text } = props;
    return (
      <text
        x={viewBox.x + 8}
        y={viewBox.y + 17}
        fill={theme.palette.text.secondary}
        textAnchor={textAnchor}
      >
        {text}
      </text>
    );
  }

  function CustomTooltip({ active, payload, label }: any) {
    if (active) {
      const price = payload[0].value;
      const floor = payload[1].value;
      const exit = payload[2].value;
      const weekNum = label;
      const toolTipData: string[][] = [
        ["Price", price.toFixed(2), "DAI/tk"],
        ["Floor", floor.toFixed(2), "DAI/tk"],
        ["Exit t.", formatter(exit), "DAI"],
        ["Week", weekNum, ""]
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
          dataKey={keyHorizontal}
          tick={{ fill: theme.palette.text.secondary }}
          stroke={theme.palette.text.secondary}
          ticks={[
            ...linspace({
              to: priceTimeseries.length,
              steps: 4
            }).map(Math.floor),
            priceTimeseries.length - 1
          ]}
        />

        {/* Price time evolution */}
        <YAxis
          yAxisId="left"
          domain={[0, Math.max(...priceTimeseries, p1 * 1.25)]}
          tickFormatter={formatter}
          tick={{ fill: theme.palette.text.secondary }}
          stroke={theme.palette.text.secondary}
        />

        {/* Capital collected from withdraw fees - AXIS */}
        <YAxis
          yAxisId="right"
          domain={[0, +(2 * withdrawFeeTimeseries.slice(-1)[0]).toPrecision(1)]}
          orientation="right"
          tick={{ fill: theme.palette.text.secondary }}
          tickFormatter={formatter}
          stroke={theme.palette.text.secondary}
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          isAnimationActive={false}
          yAxisId="left"
          type="monotone"
          dataKey={keyVerticalLeft}
          stroke={theme.palette.primary.main}
          fill={theme.palette.primary.main}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Area
          isAnimationActive={false}
          yAxisId="left"
          type="monotone"
          dataKey={keyVerticalLeft2}
          stroke={"#adcd2e"}
          fill={"#adcd2e"}
          fillOpacity={0.05}
          strokeWidth={2}
        />

        <ReferenceLine
          y={p0}
          yAxisId="left"
          stroke={theme.palette.primary.main}
          strokeDasharray="9 0"
          label={<ReferenceLabel text="Hatch sale price" />}
        />
        <ReferenceLine
          y={p1}
          yAxisId="left"
          stroke={theme.palette.primary.main}
          strokeDasharray="9 0"
          label={<ReferenceLabel text="After hatch price" />}
        />

        {/* Capital collected from withdraw fees - AREA */}
        <Area
          isAnimationActive={false}
          yAxisId="right"
          type="monotone"
          dataKey={keyVerticalRight}
          stroke={"#0085ff"}
          fill={theme.palette.secondary.dark}
          fillOpacity={0.5}
          strokeWidth={2}
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
