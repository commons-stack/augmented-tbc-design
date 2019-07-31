import React, { useState, useEffect } from "react";
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
// Utils
import { getLast, getAvg, pause } from "./utils";
// General styles
import "./app.css";

const headerOffset = 10;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      "& > div:not(:last-child)": {
        paddingBottom: theme.spacing(6)
      },
      "& > div": {
        "& > div": {
          paddingTop: "0 !important"
        }
      }
    },
    paper: {
      width: "100%",
      height: "100%",
      minHeight: 310
    },
    box: {
      padding: theme.spacing(3, 3),
      minHeight: 310
    },
    boxHeader: {
      padding: theme.spacing(3, 3),
      height: theme.spacing(headerOffset),
      display: "flex",
      alignItems: "center",
      borderBottom: "1px solid #e0e0e0"
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
    header: {
      backgroundColor: "#070a0e",
      color: "#f5f7f8",
      padding: theme.spacing(9, 0, 6 + headerOffset),
      marginBottom: -theme.spacing(headerOffset)
    },
    button: {
      background: "linear-gradient(290deg, #2ad179, #4ab47c)",
      color: "white"
    }
  })
);

export default function App() {
  const [d0, setD0] = useState(1e6); // Initial raise, d0 (DAI)
  const [theta, setTheta] = useState(0.35); // fraction allocated to reserve (.)
  const [p0, setP0] = useState(0.1); // Hatch sale Price p0 (DAI / token)
  const [returnF, setReturnF] = useState(3); // Return factor (.)
  const [wFee, setWFee] = useState(0.05); // friction coefficient (.)

  // Simulation results
  const k = returnF / (1 - theta); // Invariant power kappa (.)
  const R0 = (1 - theta / 100) * d0; // Initial reserve (DAI)
  const S0 = d0 / p0; // initial supply of tokens (token)
  const V0 = S0 ** k / R0; // invariant coef

  const [priceTimeseries, setPriceTimeseries] = useState([0]);
  const [withdrawFeeTimeseries, setWithdrawFeeTimeseries] = useState([0]);
  const [totalReserve, setTotalReserve] = useState(R0);
  const [withdrawCount, setWithdrawCount] = useState(0);
  const [avgSlippage, setAvgSlippage] = useState(0);
  const [avgTxSize] = useState(10000);
  // Simulation state variables
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);

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
      const p_t: number[] = [R0 / S0];
      const wFee_t: number[] = [0];
      const slippage_t: number[] = [];

      // Random walk
      const numSteps = 100;
      const updateEveryNth = 1;

      // Compute the random deltas
      const deltaR_t: number[] = [];
      for (let i = 0; i < numSteps; i++) {
        const rand = 1 - 2 * Math.random();
        const sin = Math.sin((1 / 20) * (i / numSteps));
        const ascending = Math.sin((Math.PI / 1) * (i / numSteps));
        const deltaR = 1e5 * rand + 1e5 * sin + 2e4 * ascending;
        deltaR_t.push(deltaR);
      }

      // Normalize random deltas with the average transaction size
      const deltaR_avg = getAvg(deltaR_t);
      const deltaR_t_normalized = deltaR_t.map(
        (deltaR: number) => (avgTxSize * deltaR) / deltaR_avg
      );

      setSimulationRunning(true);
      for (let i = 0; i < numSteps; i++) {
        const deltaR = deltaR_t_normalized[i];

        // Protect against too strong negative deltas
        const R = getLast(R_t);
        const S = getLast(S_t);
        const p = getLast(p_t);

        const R_next = R + deltaR;
        const deltaS = (V0 * (R + deltaR)) ** (1 / k) - S;
        const S_next = S + deltaS;

        R_t.push(R_next);
        S_t.push(S_next);
        p_t.push(R_next / S_next);
        // Consider withdraw fees on sales only
        if (deltaR < 0) {
          wFee_t.push(getLast(wFee_t) - deltaR * wFee);
          setWithdrawCount(c => c + 1);
        } else {
          wFee_t.push(getLast(wFee_t));
        }

        const p_next = getLast(p_t);
        // const realizedPrice = deltaR / deltaS;
        const spotPrice = p;
        const slippage = Math.abs(p_next - spotPrice) / spotPrice / 2;
        slippage_t.push(slippage);

        // Stop the simulation if it's no longer active
        if (!simulationActive || !canContinueSimulation) break;

        if (i % updateEveryNth === 0) {
          setPriceTimeseries(p_t);
          setWithdrawFeeTimeseries(wFee_t);
          setAvgSlippage(getAvg(slippage_t));
          setTotalReserve(R_next);

          // Make this run non-UI blocking
          await pause(5);
        }
      }
      setSimulationRunning(false);
    }

    if (simulationActive) simulateRandomDelta();
    // Return an "unsubscribe" function that halts the run
    return () => {
      canContinueSimulation = false;
    };
  }, [simulationActive]);

  const inputFields: {
    label: string;
    value: number;
    setter(newValue: any): void;
    min: number;
    max: number;
    step: number;
    display(value: number): string;
  }[] = [
    {
      label: "Initial raise",
      value: d0,
      setter: setD0,
      min: 0.1e6,
      max: 10e6,
      step: 0.1e6,
      display: (n: number) => `$${+(n * 1e-6).toFixed(1)}M`
    },
    {
      label: "Allocation to the project",
      value: theta,
      setter: setTheta,
      min: 0,
      max: 0.9,
      step: 0.01,
      display: (n: number) => `${Math.round(100 * n)}%`
    },
    {
      label: "Initial token price",
      value: p0,
      setter: setP0,
      min: 0.01,
      max: 1,
      step: 0.01,
      display: (n: number) => `$${n}`
    },
    {
      label: "Return factor",
      value: returnF,
      setter: setReturnF,
      min: 1,
      max: 10,
      step: 0.1,
      display: (n: number) => `${n}x`
    },
    {
      label: "Withdrawl fee",
      value: wFee,
      setter: setWFee,
      min: 0,
      max: 0.1,
      step: 0.001,
      display: (n: number) => `${+(100 * n).toFixed(1)}%`
    }
  ];

  const resultFields = [
    {
      label: `Average slippage (avg tx size ${avgTxSize} DAI)`,
      value: +(100 * avgSlippage).toFixed(3) + "%"
    },
    {
      label: `Capital collected from withdraw fees (${withdrawCount} txs)`,
      value:
        (+getLast(withdrawFeeTimeseries).toPrecision(3)).toLocaleString() +
        " DAI"
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
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper}>
              <Box className={classes.boxHeader}>
                <Grid
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">
                    {simulationActive ? "Results" : "Curve Design"}
                  </Typography>
                  <Fade in={simulationActive}>
                    <Button variant="contained" onClick={clearSimulation}>
                      Back to design
                    </Button>
                  </Fade>
                </Grid>
              </Box>

              <Box className={classes.box}>
                {simulationActive ? (
                  <ResultParams resultFields={resultFields} />
                ) : (
                  <InputParams inputFields={inputFields} />
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper className={classes.paper}>
              <Box className={classes.boxHeader}>
                <Grid
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">Preview</Typography>
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

              <Box className={classes.boxChart}>
                {simulationActive ? (
                  <PriceSimulationChart
                    priceTimeseries={priceTimeseries}
                    withdrawFeeTimeseries={withdrawFeeTimeseries}
                    p0={p0}
                  />
                ) : (
                  <SupplyVsDemandChart
                    returnF={returnF}
                    theta={theta}
                    d0={d0}
                    p0={p0}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
