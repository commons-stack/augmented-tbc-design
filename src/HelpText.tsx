import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import Fab from "@material-ui/core/Fab";
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
  typography: {
    padding: theme.spacing(2)
  },
  paper: {
    backgroundColor: "#384b59"
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
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
      >
        <Typography className={classes.typography}>{text}</Typography>
      </Popover>
    </div>
  );
}
