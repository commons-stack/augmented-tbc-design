import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";

const cadCadLink =
  "https://medium.com/block-science/cadcad-filling-a-critical-gap-in-open-source-data-science-fcd0d3faa8ed";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      // color: theme.palette.text.secondary,
    },
    subtitle: {
      color: theme.palette.text.secondary,
      margin: theme.spacing(3, 0, 0)
    },
    subsubtitle: {
      color: theme.palette.text.secondary,
      opacity: 0.6
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
    <>
      <div className={classes.logoContainer}>
        <img src="./favicon.ico" className={classes.logo} alt="logo" />
        <Typography className={classes.logoText}>Commons Stack</Typography>
      </div>

      <Typography className={classes.title} variant="h4">
        Augmented Token Bonding Curve Design
      </Typography>

      <Typography className={classes.subtitle}>
        Experiment and test augmented token bonding curves
      </Typography>
      <Typography className={classes.subsubtitle}>
        A narrative showcase of <Link href={cadCadLink}>cadCAD</Link>
        's capabilities
      </Typography>
    </>
  );
}
