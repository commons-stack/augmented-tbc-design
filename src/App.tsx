import React, { useState, useEffect, useMemo } from "react";
// Material UI
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Fade from "@material-ui/core/Fade";
// Components
import Header from "./Header";
import InputParams from "./InputParams";
import SupplyVsDemandChart from "./SupplyVsDemandChart";
import ResultParams from "./ResultParams";
import PriceSimulationChart from "./PriceSimulationChart";
import HelpText from "./HelpText";
// Utils
import { getLast, getAvg, pause } from "./utils";
import {
  getInitialParams,
  getPriceR,
  getRandomDeltas,
  getSlippage,
  getTxDistribution,
  getDeltaR_priceGrowth,
  rv_U
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
      padding: theme.spacing(3, 3),
      minHeight: 310
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
      background: "linear-gradient(290deg, #2ad179, #4ab47c)",
      color: "white"
    }
  })
);

export default function App() {
  const [curveParams, setCurveParams] = useState({
    d0: 1e6, // Initial raise, d0 (DAI)
    theta: 0.35, // fraction allocated to reserve (.)
    p0: 0.1, // Hatch sale price p0 (DAI / token)
    p1: 0.3, // Return factor (.)
    wFee: 0.05 // friction coefficient (.)
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
      const p_t: number[] = [getPriceR({ R: R0, V0, k })];
      const wFee_t: number[] = [0];
      const slippage_t: number[] = [];
      const avgTxSize_t: number[] = [];

      // Random walk
      const numSteps = 52;

      // numSteps = 52 take 8ms to run
      setSimulationRunning(true);
      for (let t = 0; t < numSteps; t++) {
        const txsWeek = Math.ceil(t < 5 ? rv_U(0, 5) : rv_U(5, 2 * t));
        const priceGrowth = rv_U(0.99, 1.03);

        const R = getLast(R_t);
        const deltaR = getDeltaR_priceGrowth({ R, k, priceGrowth });

        const R_next = R + deltaR;

        const txs = getTxDistribution({ sum: deltaR, num: txsWeek });
        // Compute slippage
        const slippage = getAvg(
          txs.map(txR => getSlippage({ R, deltaR: txR, V0, k }))
        );
        const txsWithdraw = txs.filter(tx => tx < 0);
        const wFees = -wFee * txsWithdraw.reduce((t, c) => t + c, 0);
        const _avgTxSize =
          txs.reduce((t, c) => t + Math.abs(c), 0) / txs.length;

        R_t.push(R_next);
        p_t.push(getPriceR({ R: R_next, V0, k }));
        slippage_t.push(slippage);
        avgTxSize_t.push(_avgTxSize);
        wFee_t.push(getLast(wFee_t) + wFees);
        setWithdrawCount(c => c + txsWithdraw.length);

        // Stop the simulation if it's no longer active
        if (!simulationActive || !canContinueSimulation) break;
      }

      setPriceTimeseries(p_t);
      setWithdrawFeeTimeseries(wFee_t);
      setAvgSlippage(getAvg(slippage_t));
      setAvgTxSize(getAvg(avgTxSize_t));
      setTotalReserve(getLast(R_t));

      // Make this run non-UI blocking
      await pause(5);

      setSimulationRunning(false);
    }

    if (simulationActive) simulateRandomDelta();
    // Return an "unsubscribe" function that halts the run
    return () => {
      canContinueSimulation = false;
    };
  }, [simulationActive]);

  const resultFields = [
    {
      label: `Average slippage (avg tx size ${Math.round(
        avgTxSize
      ).toLocaleString()} DAI)`,
      value: +(100 * avgSlippage).toFixed(3) + "%"
    },
    {
      label: `Capital collected from withdraw fees (${withdrawCount} txs)`,
      value:
        (+getLast(withdrawFeeTimeseries).toPrecision(3)).toLocaleString() +
        " DAI"
    },
    {
      label: `Capital collected from initial hatch`,
      value: Math.round(d0 * theta).toLocaleString() + " DAI"
    },
    {
      label: `Total reserve`,
      value: (+totalReserve.toPrecision(3)).toLocaleString() + " DAI"
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
                    <span>
                      Description of the different parameters <br />
                      Initial raise: Lorem ipsum <br />
                      Allocation to project: Lorem ipsum <br />
                      Initial token price: Lorem ipsum <br />
                      Return factor: Lorem ipsum <br />
                      Withdrawl fee: Lorem ipsum
                    </span>
                  }
                />
              </Box>

              <Box className={classes.box}>
                <InputParams setCurveParams={setCurveParamsThrottle} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={12} md={6} lg={8}>
            <Paper className={classes.paper}>
              <Box className={classes.boxHeader}>
                <Typography variant="h6">Preview</Typography>
                <HelpText
                  text={<span>Preview of the token bonding curve</span>}
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
                      text={<span>Some context about this simulation</span>}
                    />
                  </Box>

                  <Box className={classes.boxChart}>
                    <PriceSimulationChart
                      priceTimeseries={priceTimeseries}
                      withdrawFeeTimeseries={withdrawFeeTimeseries}
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
                        <span>Explanation of what do this results mean</span>
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
