import React, { useState, useEffect, useMemo } from "react";
import {
  createStyles,
  makeStyles,
  withStyles,
  Theme
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import NumberFormat from "react-number-format";
import { throttle } from "lodash";

const grayColor = "#90a4ae";
const blackColor = "#141e27";
// const commonsGradient = "#67de69 #1c709c";
const strongColor = "#4ab47c";

const PrettoSlider = withStyles({
  root: {
    color: strongColor,
    height: 8
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    marginTop: -8,
    marginLeft: -12,
    "&:focus,&:hover,&$active": {
      boxShadow: "inherit"
    }
  },
  active: {},
  valueLabel: {
    left: "calc(-50% + 4px)"
  },
  track: {
    height: 8,
    borderRadius: 4
  },
  rail: {
    height: 8,
    borderRadius: 4
  },
  markLabel: {
    color: grayColor,
    top: 30
  }
})(Slider);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(6, 0, 3)
    },
    lightBulb: {
      verticalAlign: "middle",
      marginRight: theme.spacing(1)
    },
    leftContainer: {
      color: grayColor
    },
    centerContainer: {
      color: blackColor
    },
    listBoxContainer: {
      "& > div:not(:last-child)": {
        paddingBottom: "12px",
        marginBottom: "12px",
        borderBottom: "1px solid #e0e0e0"
      }
    },
    listBox: {
      height: "48px",
      "& > div": {
        display: "flex",
        alignItems: "center",
        "& p": {
          marginBottom: 0
        }
      },
      "& > div:not(:last-child)": {
        paddingRight: "12px"
      }
    }
  })
);

function NumberFormatCustom(props: any) {
  const { inputRef, onChange, prefix, suffix, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({ target: { value: values.value } });
      }}
      thousandSeparator
      prefix={prefix}
      suffix={suffix}
    />
  );
}

export default function InputParams({
  curveParams,
  setCurveParams
}: {
  curveParams?: {
    d0: number;
    theta: number;
    p0: number;
    returnF: number;
    wFee: number;
  };
  setCurveParams(newCurveParams: any): void;
}) {
  const [d0, setD0] = useState(1e6); // Initial raise, d0 (DAI)
  const [theta, setTheta] = useState(0.35); // fraction allocated to reserve (.)
  const [p0, setP0] = useState(0.1); // Hatch sale Price p0 (DAI / token)
  const [returnF, setReturnF] = useState(3); // Return factor (.)
  const [wFee, setWFee] = useState(0.05); // friction coefficient (.)

  function setParentCurveParams() {
    setCurveParams({ d0, theta, p0, returnF, wFee });
  }

  const inputFields: {
    label: string;
    value: number;
    setter(newValue: any): void;
    min: number;
    max: number;
    step: number;
    unit?: string;
    prefix?: string;
    suffix?: string;
    toText?(value: number): string;
    toNum?(value: string): number;
    format(value: number): string;
  }[] = [
    {
      label: "Initial raise",
      value: d0,
      setter: setD0,
      min: 0.1e6,
      max: 10e6,
      step: 0.1e6,
      unit: "$M",
      prefix: "$",
      suffix: "M",
      format: (n: number) => `$${+(n * 1e-6).toFixed(1)}M`,
      toText: (n: number) => String(+(n * 1e-6).toFixed(1)),
      toNum: (n: string) => Math.floor(parseFloat(n) * 1e6)
    },
    {
      label: "Allocation to the project",
      value: theta,
      setter: setTheta,
      min: 0,
      max: 0.9,
      step: 0.01,
      unit: "%",
      suffix: "%",
      format: (n: number) => `${Math.round(100 * n)}%`,
      toText: (n: number) => String(+(n * 1e2).toFixed(0)),
      toNum: (n: string) => parseFloat(n) * 1e-2
    },
    {
      label: "Initial token price",
      value: p0,
      setter: setP0,
      min: 0.01,
      max: 1,
      step: 0.01,
      unit: "$",
      prefix: "$",
      format: (n: number) => `$${n}`
    },
    {
      label: "Return factor",
      value: returnF,
      setter: setReturnF,
      min: 1,
      max: 10,
      step: 0.1,
      unit: "x",
      suffix: "x",
      format: (n: number) => `${n}x`
    },
    {
      label: "Withdrawl fee",
      value: wFee,
      setter: setWFee,
      min: 0,
      max: 0.1,
      step: 0.001,
      unit: "%",
      suffix: "%",
      format: (n: number) => `${+(100 * n).toFixed(1)}%`,
      toText: (n: number) => String(+(n * 1e2).toFixed(1)),
      toNum: (n: string) => parseFloat(n) * 1e-2
    }
  ];

  const classes = useStyles();

  return (
    <div className={classes.listBoxContainer}>
      {inputFields.map(
        ({
          label,
          value,
          setter,
          min,
          max,
          step,
          prefix,
          suffix,
          format,
          toText,
          toNum
        }) => {
          function sanitizeInput(num: number = 0) {
            if (isNaN(num)) num = 0;
            if (num > max) num = max;
            else if (num < min) num = min;
            setter(num);
          }

          return (
            <Grid key={label} container spacing={0} className={classes.listBox}>
              <Grid item xs={6} className={classes.leftContainer}>
                <Typography id={label} gutterBottom>
                  {label}
                </Typography>
              </Grid>

              <Grid item xs={2} className={classes.centerContainer}>
                {/* <Typography gutterBottom>{display(value)}</Typography> */}
                <TextField
                  onChange={e => {
                    sanitizeInput(
                      toNum ? toNum(e.target.value) : parseFloat(e.target.value)
                    );
                    setParentCurveParams();
                  }}
                  InputProps={{
                    inputComponent: NumberFormatCustom,
                    disableUnderline: true,
                    inputProps: {
                      prefix,
                      suffix
                    }
                  }}
                  value={toText ? toText(value) : value}
                />
              </Grid>

              <Grid item xs={4}>
                <PrettoSlider
                  valueLabelDisplay="auto"
                  aria-label={label}
                  defaultValue={value}
                  onChange={(_, newValue) => sanitizeInput(Number(newValue))}
                  onChangeCommitted={setParentCurveParams}
                  value={value}
                  min={min}
                  max={max}
                  step={step}
                  valueLabelFormat={value => format(value).replace("$", "")}
                  // marks={[
                  //   { value: 0, label: "0%" },
                  //   { value: 50, label: "50%" },
                  //   { value: 100, label: "100%" }
                  // ]}
                />
              </Grid>
            </Grid>
          );
        }
      )}
    </div>
  );
}
