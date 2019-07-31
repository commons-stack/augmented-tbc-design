import React from "react";
import {
  createStyles,
  makeStyles,
  withStyles,
  Theme
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
import Grid from "@material-ui/core/Grid";

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

export default function InputParams({
  inputFields
}: {
  inputFields: {
    label: string;
    value: number;
    setter(newValue: any): void;
    min: number;
    max: number;
    step: number;
    display(value: number): string;
  }[];
}) {
  const classes = useStyles();

  return (
    <div className={classes.listBoxContainer}>
      {inputFields.map(({ label, value, setter, min, max, step, display }) => (
        <Grid key={label} container spacing={0} className={classes.listBox}>
          <Grid item xs={6} className={classes.leftContainer}>
            <Typography id={label} gutterBottom>
              {label}
            </Typography>
          </Grid>

          <Grid item xs={2} className={classes.centerContainer}>
            <Typography gutterBottom>{display(value)}</Typography>
          </Grid>

          <Grid item xs={4}>
            <PrettoSlider
              valueLabelDisplay="auto"
              aria-label={label}
              defaultValue={value}
              onChange={(_, newValue) => setter(Number(newValue))}
              min={min}
              max={max}
              step={step}
              valueLabelFormat={value => display(value).replace("$", "")}
              // marks={[
              //   { value: 0, label: "0%" },
              //   { value: 50, label: "50%" },
              //   { value: 100, label: "100%" }
              // ]}
            />
          </Grid>
        </Grid>
      ))}
    </div>
  );
}
