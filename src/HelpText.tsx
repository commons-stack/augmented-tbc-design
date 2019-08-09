import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import Box from "@material-ui/core/Box";
import HelpIcon from "@material-ui/icons/HelpOutline";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    marginLeft: "6px",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "opacity ease 150ms",
    opacity: 0.2,
    "&:hover": {
      opacity: 0.85
    }
  },
  popoverContainer: {
    padding: theme.spacing(2)
  },
  paper: {
    backgroundColor: "#384b59",
    maxWidth: theme.breakpoints.values.md * 0.9,
    [`@media screen and (max-width: ${theme.breakpoints.values.md}px)`]: {
      maxWidth: "90vw"
    }
  }
}));

export default function SimplePopover({ text }: { text: any }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(e: any) {
    setAnchorEl(e.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div className={classes.container}>
      <HelpIcon onClick={handleClick} />

      <Popover
        PaperProps={{
          className: classes.paper
        }}
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        onClick={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
      >
        <Box className={classes.popoverContainer}>{text}</Box>
      </Popover>
    </div>
  );
}
