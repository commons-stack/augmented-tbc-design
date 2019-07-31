import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";

const strongColor = "#4ab47c";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(3, 0, 0)
    },
    lightBulb: {
      verticalAlign: "middle",
      marginRight: theme.spacing(1)
    },
    link: {
      color: strongColor
    }
  })
);

export default function Header() {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Augmented Token Bonding Curve Design
      </Typography>
      <Typography className={classes.root}>
        Experiment and test augmented token bonding curves, part of the{" "}
        <Link className={classes.link} href="https://commonsstack.org/">
          Commons Stack
        </Link>
      </Typography>
    </>
  );
}
