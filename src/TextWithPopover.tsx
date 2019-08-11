import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles(theme => ({
  container: {
    color: theme.palette.text.secondary,
    display: "flex",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "color ease 150ms",
    "&:hover": {
      color: "#c3c9d0"
    }
  },
  popoverContainer: {
    padding: theme.spacing(2),
    "& > p:not(:last-child)": {
      paddingBottom: theme.spacing(1),
      marginBottom: theme.spacing(1),
      borderBottom: "1px solid #3f5463"
    }
  },
  paper: {
    backgroundColor: "#384b59",
    maxWidth: theme.breakpoints.values.md * 0.9,
    [`@media screen and (max-width: ${theme.breakpoints.values.md}px)`]: {
      maxWidth: "90vw"
    },
    padding: theme.spacing(0.5)
  },
  descriptionBody: {
    color: "#dbdfe4"
  }
}));

export default function TextWithPopover({
  content,
  popoverText
}: {
  content: string;
  popoverText: string;
}) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(event: any) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div className={classes.container}>
      <div aria-describedby={id} onClick={handleClick}>
        <Typography>{content}</Typography>
      </div>
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
        <Box className={classes.popoverContainer}>
          <Typography>{content}</Typography>
          <Typography className={classes.descriptionBody}>
            {popoverText}
          </Typography>
        </Box>
      </Popover>
    </div>
  );
}
