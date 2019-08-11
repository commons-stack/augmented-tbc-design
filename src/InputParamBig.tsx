import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import NumberFormat from "react-number-format";
import { InputFieldInterface } from "./types";
import PrettoSlider from "./PrettoSlider";
import HelpText from "./HelpText";

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
      // color: theme.palette.text.secondary
    },
    centerContainer: {
      // color: blackColor
    },
    listBoxContainer: {
      "& > div:not(:last-child)": {
        paddingBottom: "12px",
        marginBottom: "12px",
        borderBottom: "1px solid #313d47"
      }
    },
    listBox: {
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
    },
    slider: {
      color: theme.palette.primary.main
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

export default function InputParamBig({
  inputFields,
  onChangeCommited
}: {
  inputFields: InputFieldInterface[];
  onChangeCommited(): void;
}) {
  const classes = useStyles();

  return (
    <div className={classes.listBoxContainer}>
      {inputFields.map(
        ({
          label,
          description,
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
              <Grid
                item
                xs={6}
                sm={6}
                md={3}
                lg={2}
                className={classes.leftContainer}
              >
                <Typography variant="h6">{label}</Typography>
                <HelpText title={label} body={description} />
              </Grid>

              <Grid
                item
                xs={2}
                sm={2}
                md={1}
                className={classes.centerContainer}
              >
                <TextField
                  onChange={e => {
                    sanitizeInput(
                      toNum ? toNum(e.target.value) : parseFloat(e.target.value)
                    );
                    onChangeCommited();
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

              <Grid item xs={4} sm={4} md={8} lg={9}>
                <PrettoSlider
                  className={classes.slider}
                  valueLabelDisplay="auto"
                  aria-label={label}
                  defaultValue={value}
                  onChange={(_, newValue) => sanitizeInput(Number(newValue))}
                  onChangeCommitted={onChangeCommited}
                  value={value}
                  min={min}
                  max={max}
                  step={step}
                  valueLabelFormat={value => format(value).replace("$", "")}
                />
              </Grid>
            </Grid>
          );
        }
      )}
    </div>
  );
}
