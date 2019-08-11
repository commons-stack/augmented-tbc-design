import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
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
  },
  // Descriptions
  descriptionContainer: {
    "& > div:not(:last-child)": {
      paddingBottom: theme.spacing(1),
      marginBottom: theme.spacing(1),
      borderBottom: "1px solid #3f5463"
    },
    "& td": {
      verticalAlign: "top",
      padding: theme.spacing(0.5)
    }
  },
  descriptionTitle: {
    padding: theme.spacing(0.5)
  },
  descriptionBody: {
    color: "#dbdfe4",
    padding: theme.spacing(0.5)
  },
  descriptionPadding: {
    padding: theme.spacing(0.5)
  }
}));

export default function SimplePopover({
  text,
  title,
  table,
  body
}: {
  text?: any;
  title?: string;
  table?: { name: string; text: string }[];
  body?: string;
}) {
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
        <Box className={classes.popoverContainer}>
          <div className={classes.descriptionContainer}>
            {title && (
              <div>
                <Typography className={classes.descriptionTitle}>
                  {title}
                </Typography>
              </div>
            )}

            {body && (
              <div>
                <Typography className={classes.descriptionBody}>
                  {body}
                </Typography>
              </div>
            )}

            {table && (
              <div>
                <table>
                  <tbody>
                    {table.map(({ name, text }) => (
                      <tr key={name}>
                        <td>
                          <Typography>{name}</Typography>
                        </td>
                        <td>
                          <Typography className={classes.descriptionBody}>
                            {text}
                          </Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {text}
          </div>
        </Box>
      </Popover>
    </div>
  );
}
