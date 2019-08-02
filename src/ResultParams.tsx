import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

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
      color: theme.palette.text.secondary
    },
    centerContainer: {
      // color: blackColor
    },
    listBoxContainer: {
      "& > div:not(:last-child)": {
        marginBottom: "12px",
        borderBottom: "1px solid #313d47"
      }
    },
    listBox: {
      paddingBottom: "12px",
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

export default function ResultParams({
  resultFields
}: {
  resultFields: {
    label: string;
    value: number | string;
  }[];
}) {
  const classes = useStyles();

  return (
    <div className={classes.listBoxContainer}>
      {resultFields.map(({ label, value }) => (
        <Grid key={label} container spacing={0} className={classes.listBox}>
          <Grid item xs={8} className={classes.leftContainer}>
            <Typography id={label} gutterBottom>
              {label}
            </Typography>
          </Grid>

          <Grid item xs={4} className={classes.centerContainer}>
            <Typography gutterBottom>{value}</Typography>
          </Grid>
        </Grid>
      ))}
    </div>
  );
}
