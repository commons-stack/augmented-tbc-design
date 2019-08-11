import React, { useState, useEffect } from "react";
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
import { linspace, getUnits } from "./utils";

const keyHorizontal = "x";
const keyVerticalLeft = "Price (DAI/token)";
const keyVerticalLeft2 = "Floor price (DAI/token)";
const keyVerticalRight = "Total funds raised (DAI)";
const p1LineText = "Post-Hatch price";
const p0LineText = "Hatch price";

// Do to transparency and color merging issues
// these colors are handpicked to look the closest to the theme colors
const yLeftColor = "#53c388";
const yRightColor = "#4090d9";
const referenceLineColor = "#b7c1cb";

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
  totalFundsRaisedTimeseries,
  floorpriceTimeseries,
  simulationDuration,
  p0,
  p1
}: {
  priceTimeseries: number[];
  totalFundsRaisedTimeseries: number[];
  floorpriceTimeseries: number[];
  simulationDuration: number;
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
      [keyVerticalRight]: totalFundsRaisedTimeseries[t] || 0
    });
  }

  /**
   * When resizing the window the chart animation looks very bad
   * Keep the animation active only during the initial animation time,
   * but afterwards, deactivate to prevent the re-size ugly effect
   */
  const [isAnimationActive, setIsAnimationActive] = useState(
    process.env.NODE_ENV !== "development"
  );
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsAnimationActive(false);
    }, simulationDuration + 100);
    return () => {
      clearTimeout(timeout);
    };
  });

  // Compute chart related math

  const totalFundsMin = totalFundsRaisedTimeseries[0];
  const totalFundsMax = totalFundsRaisedTimeseries.slice(-1)[0];
  const totalFundsRange = totalFundsMax - totalFundsMin;

  const daiFormatter = (n: number) => (+n.toFixed(2)).toLocaleString();
  const { scaling, unit } = getUnits(totalFundsMax);
  const fundsFormatter = (n: number) => (+n.toPrecision(3)).toLocaleString();
  const fundsFormatterShort = (n: number) =>
    (+(n / scaling).toPrecision(3)).toLocaleString();

  // Load styles

  const theme: any = useTheme();
  const classes = useStyles();

  // Chart components

  function renderColorfulLegendText(value: string) {
    return <span style={{ color: theme.palette.text.secondary }}>{value}</span>;
  }

  function ReferenceLabel(props: any) {
    const { textAnchor, viewBox, text, fill } = props;
    return (
      <text
        x={viewBox.x + 4}
        y={viewBox.y + 17}
        fill={referenceLineColor}
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
      const funds = payload[2].value;
      const weekNum = label;
      const toolTipData: string[][] = [
        ["Price", daiFormatter(price), "DAI/tk"],
        ["Floor P.", daiFormatter(floor), "DAI/tk"],
        ["Funds R.", fundsFormatterShort(funds) + unit, "DAI"],
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
        <CartesianGrid
          vertical={false}
          stroke={theme.palette.text.secondary}
          strokeOpacity={0.13}
        />
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
          tickFormatter={daiFormatter}
          tick={{ fill: yLeftColor }}
          stroke={yLeftColor}
        />

        {/* Capital collected from withdraw fees - AXIS */}
        <YAxis
          yAxisId="right"
          domain={[
            totalFundsMin.toPrecision(2),
            +(totalFundsMax + totalFundsRange).toPrecision(2)
          ]}
          orientation="right"
          tickFormatter={fundsFormatter}
          tick={{ fill: yRightColor }}
          stroke={yRightColor}
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          isAnimationActive={isAnimationActive}
          animationDuration={simulationDuration}
          yAxisId="left"
          type="monotone"
          dataKey={keyVerticalLeft}
          stroke={theme.palette.primary.main}
          fill={theme.palette.primary.main}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Area
          isAnimationActive={isAnimationActive}
          animationDuration={simulationDuration}
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
          label={<ReferenceLabel text={p0LineText} />}
        />
        <ReferenceLine
          y={p1}
          yAxisId="left"
          stroke={theme.palette.primary.main}
          label={<ReferenceLabel text={p1LineText} />}
        />

        {/* Capital collected from withdraw fees - AREA */}
        <Area
          isAnimationActive={isAnimationActive}
          animationDuration={simulationDuration}
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
