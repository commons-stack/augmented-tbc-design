import React, { useState, useEffect, useMemo } from "react";
// Material UI
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
// Components
import Header from "./Header";
import CurveDesignInputParams from "./CurveDesignInputParams";
import SimulationInputParams from "./SimulationInputParams";
import SupplyVsDemandChart from "./SupplyVsDemandChart";
import ResultParams from "./ResultParams";
import PriceSimulationChart from "./PriceSimulationChart";
import HelpText from "./HelpText";
// Text content
import {
  parameterDescriptions,
  simulationParameterDescriptions,
  resultParameterDescriptions,
  supplyVsDemandChartDescription,
  simulationChartDescription
} from "./parametersDescriptions";
// Utils
import { getLast, getAvg, pause } from "./utils";
import {
  getInitialParams,
  getPriceR,
  getMinPrice,
  getS,
  vest_tokens,
  getR,
  getSlippage,
  getTxDistribution,
  getDeltaR_priceGrowth,
  rv_U,
  getMedian,
  getSum
} from "./math";
import { throttle } from "lodash";
// General styles
import "./app.css";

const headerOffset = 10;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      "& > div:not(:last-child)": {
        paddingBottom: theme.spacing(3)
      },
      "& > div": {
        "& > div": {
          paddingTop: "0 !important"
        }
      },
      paddingBottom: theme.spacing(9)
    },
    simulationContainer: {
      minHeight: "442px"
    },
    paper: {
      width: "100%",
      height: "100%",
      minHeight: 310,
      backgroundColor: "#293640"
    },
    box: {
      padding: theme.spacing(3, 3)
    },
    boxButton: {
      padding: theme.spacing(3, 3)
    },
    boxHeader: {
      padding: theme.spacing(3, 3),
      height: theme.spacing(headerOffset),
      display: "flex",
      alignItems: "center",
      borderBottom: "1px solid #313d47"
    },
    boxBorderBottom: {
      borderBottom: "1px solid #313d47"
    },
    initialRaise: {
      justifyContent: "space-between"
    },
    boxChart: {
      width: "100%",
      height: "100%",
      minHeight: 310,
      maxHeight: 350,
      padding: theme.spacing(3, 3),
      // Correct the chart excessive margins
      paddingRight: "5px",
      paddingLeft: "5px"
    },
    boxPlaceholder: {
      padding: theme.spacing(3, 3),
      display: "flex",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      color: theme.palette.text.secondary,
      opacity: 0.4
    },
    header: {
      backgroundColor: "#0b1216",
      color: "#f8f8f8",
      textAlign: "center",
      padding: theme.spacing(3, 0, 6 + headerOffset),
      marginBottom: -theme.spacing(headerOffset)
    },
    button: {
      // background: "linear-gradient(290deg, #2ad179, #4ab47c)", // Green gradient
      background: "linear-gradient(290deg, #1880e0, #3873d8)", // blue gradient
      color: "white"
    },
    // Descriptions
    descriptionContainer: {
      "& > div:not(:last-child)": {
        paddingBottom: theme.spacing(1),
        marginBottom: theme.spacing(1),
        borderBottom: "1px solid #3f5463"
      },
      "& td": {
        verticalAlign: "top",
        padding: theme.spacing(0.5)
      }
    },
    descriptionTitle: {
      padding: theme.spacing(0.5)
    },
    descriptionBody: {
      color: "#dbdfe4"
    },
    descriptionPadding: {
      padding: theme.spacing(0.5)
    }
  })
);

export default function App() {
  const [curveParams, setCurveParams] = useState({
    theta: 0.35, // fraction allocated to reserve (.)
    p0: 0.1, // Hatch sale price p0 (DAI / token)
    p1: 0.3, // Return factor (.)
    wFee: 0.05, // friction coefficient (.)
    d0: 3e6 // Initial raise, d0 (DAI)
  });

  const { d0, theta, p0, p1, wFee } = curveParams;

  /**
   * Throttle the curve update to prevent the expensive chart
   * to re-render too often
   */
  const setCurveParamsThrottle = useMemo(
    () => throttle(setCurveParams, 250),
    []
  );

  // Simulation results
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

  const [priceTimeseries, setPriceTimeseries] = useState([0]);
  const [withdrawFeeTimeseries, setWithdrawFeeTimeseries] = useState([0]);
  const [floorpriceTimeseries, setFloorpriceTimeseries] = useState([0]);
  const [totalReserve, setTotalReserve] = useState(R0);
  const [withdrawCount, setWithdrawCount] = useState(0);
  const [avgSlippage, setAvgSlippage] = useState(0);
  const [avgTxSize, setAvgTxSize] = useState(0);
  // Simulation state variables
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);

  useEffect(() => {
    setSimulationActive(false);
  }, [curveParams]);

  // #### TEST: Immediate simulation

  async function startSimulation() {
    // If there's a simulation already active, clear it
    clearSimulation();
    await pause(0);

    // Start simulation by setting it to active
    setSimulationActive(true);
  }

  function clearSimulation() {
    // Stop simulation
    setSimulationActive(false);
    // Clear simulation variables
    setWithdrawCount(0);
    setPriceTimeseries([0]);
    setWithdrawFeeTimeseries([0]);
    setAvgSlippage(0);
  }

  useEffect(() => {
    let canContinueSimulation = true;

    async function simulateRandomDelta() {
      const R_t: number[] = [R0];
      const S_t: number[] = [S0];
      const p_t: number[] = [getPriceR({ R: R0, V0, k })];
      const wFee_t: number[] = [0];
      const slippage_t: number[] = [];
      const avgTxSize_t: number[] = [];

      // hatchers tokens = S0[section added by Z]
      const H_t: number[] = [S0]; // total hatcher tokens not vested
      const floorprice_t: number[] = []; // initially the price is the floor as all tokens are hatcher tokens

      // Random walk
      const numSteps = 52;
      const u_min = 0.97;
      const u_max = 1.04;
      const tx_spread = 10;
      // vesting(should this be exposed in the app ?)
      const cliff = 8; // weeks before vesting starts ~2 months
      const halflife = 52; // 26 weeks, half life is ~6 months
      // percentage of the hatch tokens which vest per week(since that is our timescale in the sim)

      // numSteps = 52 take 8ms to run
      setSimulationRunning(true);
      for (let t = 0; t < numSteps; t++) {
        const txsWeek = rv_U(5, 2 * t + 5);

        const R = getLast(R_t);
        const S = getLast(S_t);
        const H = getLast(H_t);

        // enforce the effects of the unvested tokens not being burnable
        let u_lower;
        if (H > S) {
          u_lower = 1;
        } else {
          // compute the reserve if all that supply is burned
          const R_ratio = getR({ S: S - H, V0, k }) / R;
          u_lower = Math.max(1 - R_ratio, u_min);
        }
        const priceGrowth = rv_U(u_lower, u_max);

        const deltaR = getDeltaR_priceGrowth({ R, k, priceGrowth });
        const R_next = R + deltaR;

        const txs = getTxDistribution({
          sum: deltaR,
          num: txsWeek,
          spread: tx_spread
        });
        // Compute slippage
        const slippage_txs = txs.map(txR =>
          getSlippage({ R, deltaR: txR, V0, k })
        );
        const slippage = getMedian(slippage_txs);

        const txsWithdraw = txs.filter(tx => tx < 0);
        const wFees = -wFee * getSum(txsWithdraw);
        //  txsWithdraw.reduce((t, c) => t + c, 0);

        // Vest
        const delta_H = vest_tokens({ week: t, H, halflife, cliff });
        const H_next = H - delta_H;

        // find floor price
        const S_next = getS({ R, V0, k });
        const floorprice_next = getMinPrice({
          S: S_next,
          H: S_next - H_next,
          V0,
          k
        });

        const _avgTxSize = getMedian(txsWithdraw);

        R_t.push(R_next);
        S_t.push(S_next);
        H_t.push(H_next);
        p_t.push(getPriceR({ R: R_next, V0, k }));
        slippage_t.push(slippage);
        avgTxSize_t.push(_avgTxSize);
        wFee_t.push(getLast(wFee_t) + wFees);

        floorprice_t.push(floorprice_next);
        setWithdrawCount(c => c + txsWithdraw.length);

        // Stop the simulation if it's no longer active
        if (!simulationActive || !canContinueSimulation) break;
      }

      // floorprice_t is missing one data point
      floorprice_t[floorprice_t.length] = floorprice_t[floorprice_t.length - 1];

      setPriceTimeseries(p_t);
      setWithdrawFeeTimeseries(wFee_t);
      setFloorpriceTimeseries(floorprice_t);
      setAvgSlippage(getAvg(slippage_t));
      setAvgTxSize(getAvg(avgTxSize_t));
      setTotalReserve(getLast(R_t));

      setSimulationRunning(false);
    }

    if (simulationActive) simulateRandomDelta();
    // Return an "unsubscribe" function that halts the run
    return () => {
      canContinueSimulation = false;
    };
  }, [simulationActive]);

  // End results computed for chart visualization
  const initialHatchFunds = d0 * theta;
  const totalFundsRaisedTimeseries = withdrawFeeTimeseries.map(
    x => x + initialHatchFunds
  );

  const resultFields = [
    {
      label: resultParameterDescriptions.totalReserve.name,
      description: resultParameterDescriptions.totalReserve.text,
      value: (+totalReserve.toPrecision(3)).toLocaleString() + " DAI"
    },
    {
      label: resultParameterDescriptions.initialHatchFunds.name,
      description: resultParameterDescriptions.initialHatchFunds.text,
      value: Math.round(d0 * theta).toLocaleString() + " DAI"
    },
    {
      label: `${
        resultParameterDescriptions.exitTributes.name
      } (${withdrawCount} txs)`,
      description: resultParameterDescriptions.exitTributes.text,
      value:
        (+getLast(withdrawFeeTimeseries).toPrecision(3)).toLocaleString() +
        " DAI"
    },
    {
      label: `${
        resultParameterDescriptions.slippage.name
      } (avg tx size ${Math.round(avgTxSize).toLocaleString()} DAI)`,
      description: resultParameterDescriptions.slippage.text,
      value: +(100 * avgSlippage).toFixed(3) + "%"
    }
  ];

  const classes = useStyles();

  return (
    <>
      <header className={classes.header}>
        <Container fixed>
          <Header />
        </Container>
      </header>

      <Container fixed className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={6} lg={4}>
            <Paper className={classes.paper}>
              <Box className={classes.boxHeader}>
                <Typography variant="h6">Curve Design</Typography>
                <HelpText
                  text={
                    <div className={classes.descriptionContainer}>
                      <div>
                        <Typography className={classes.descriptionTitle}>
                          Parameters description:
                        </Typography>
                      </div>
                      <table>
                        <tbody>
                          {[
                            parameterDescriptions.theta,
                            parameterDescriptions.p0,
                            parameterDescriptions.p1,
                            parameterDescriptions.wFee,
                            parameterDescriptions.d0
                          ].map(({ name, text }) => (
                            <tr key={name}>
                              <td>
                                <Typography>{name}</Typography>
                              </td>
                              <td>
                                <Typography className={classes.descriptionBody}>
                                  {text}
                                </Typography>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  }
                />
              </Box>

              <Box className={`${classes.box} ${classes.boxBorderBottom}`}>
                <CurveDesignInputParams
                  curveParams={curveParams}
                  setCurveParams={setCurveParamsThrottle}
                />
              </Box>

              <Box className={`${classes.boxHeader} ${classes.initialRaise}`}>
                <Typography variant="h6">Run parameters</Typography>
              </Box>

              <Box className={classes.box}>
                <SimulationInputParams
                  curveParams={curveParams}
                  setCurveParams={setCurveParamsThrottle}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={12} md={6} lg={8}>
            <Paper className={classes.paper}>
              <Box className={classes.boxHeader}>
                <Typography variant="h6">Preview</Typography>
                <HelpText
                  text={
                    <div className={classes.descriptionPadding}>
                      <Typography className={classes.descriptionBody}>
                        {supplyVsDemandChartDescription}
                      </Typography>
                    </div>
                  }
                />
              </Box>

              <Box className={classes.boxChart}>
                <SupplyVsDemandChart theta={theta} d0={d0} p0={p0} p1={p1} />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Paper>
              <Box className={classes.boxHeader}>
                <Grid
                  container
                  direction="row"
                  justify="center"
                  alignItems="center"
                >
                  <Button
                    variant="contained"
                    className={classes.button}
                    onClick={startSimulation}
                    disabled={simulationRunning}
                  >
                    Run simulation
                  </Button>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3} className={classes.simulationContainer}>
          {simulationActive ? (
            <>
              <Grid item xs={12} sm={12} md={6} lg={8}>
                <Paper className={classes.paper}>
                  <Box className={classes.boxHeader}>
                    <Typography variant="h6">Simulation</Typography>
                    <HelpText
                      text={
                        <div className={classes.descriptionContainer}>
                          <div className={classes.descriptionPadding}>
                            <Typography className={classes.descriptionBody}>
                              {simulationChartDescription}
                            </Typography>
                          </div>

                          <table>
                            <tbody>
                              {Object.values(
                                simulationParameterDescriptions
                              ).map(({ name, text }) => (
                                <tr key={name}>
                                  <td>
                                    <Typography>{name}</Typography>
                                  </td>
                                  <td>
                                    <Typography
                                      className={classes.descriptionBody}
                                    >
                                      {text}
                                    </Typography>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      }
                    />
                  </Box>

                  <Box className={classes.boxChart}>
                    <PriceSimulationChart
                      priceTimeseries={priceTimeseries}
                      floorpriceTimeseries={floorpriceTimeseries}
                      totalFundsRaisedTimeseries={totalFundsRaisedTimeseries}
                      p0={p0}
                      p1={p1}
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Paper className={classes.paper}>
                  <Box className={classes.boxHeader}>
                    <Typography variant="h6">Results</Typography>
                    <HelpText
                      text={
                        <div className={classes.descriptionContainer}>
                          <div>
                            <Typography className={classes.descriptionTitle}>
                              Result parameters description:
                            </Typography>
                          </div>
                          <table>
                            <tbody>
                              {Object.values(resultParameterDescriptions).map(
                                ({ name, text }) => (
                                  <tr key={name}>
                                    <td>
                                      <Typography>{name}</Typography>
                                    </td>
                                    <td>
                                      <Typography
                                        className={classes.descriptionBody}
                                      >
                                        {text}
                                      </Typography>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      }
                    />
                  </Box>

                  <Box className={classes.box}>
                    <ResultParams resultFields={resultFields} />
                  </Box>
                </Paper>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Box className={classes.boxPlaceholder}>
                  <Typography variant="h6">
                    Run a simulation to see results
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
}
