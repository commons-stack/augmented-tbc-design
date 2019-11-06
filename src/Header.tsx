import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";

const cadCadLink =
  "https://medium.com/giveth/deep-dive-augmented-bonding-curves-3f1f7c1fa751";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    title: {
      // color: theme.palette.text.secondary,
    },
    subtitle: {
      color: theme.palette.text.secondary,
      margin: theme.spacing(3, 0, 0),
      maxWidth: theme.spacing(82)
    },
    subsubtitle: {
      color: theme.palette.text.secondary,
      opacity: 0.6,
      maxWidth: theme.spacing(74)
    },
    lightBulb: {
      verticalAlign: "middle",
      marginRight: theme.spacing(1)
    },
    link: {
      color: theme.palette.primary.main
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing(4)
    },
    logo: {
      width: "25px",
      marginRight: "4px"
    },
    logoText: {
      display: "inline",
      fontSize: "1.1rem",
      fontWeight: 500
    }
  })
);

export default function Header() {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.logoContainer}>
        <img src="./favicon.ico" className={classes.logo} alt="logo" />
        <Typography className={classes.logoText}>Commons Stack</Typography>
      </div>

      <Typography className={classes.title} variant="h4">
        Augmented Bonding Curve Design
      </Typography>

      <Typography className={classes.subtitle}>
        Experiment with the Commons Stack's Augmented Bonding Curve component.
        Change the Hatch variables to explore what continuous funding streams 
        can do for your community.
      </Typography>
      <Typography className={classes.subsubtitle}>
        Read more about the Augmented Bonding Curve{" "}
        <Link href={cadCadLink}>here</Link>. Note that this is a demo for
        illustration purposes only, a narrative showcase of cadCAD's
        capabilities.
      </Typography>
    </div>
  );
}
