import red from "@material-ui/core/colors/red";
import { createMuiTheme } from "@material-ui/core/styles";

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#2ecd79"
    },
    secondary: {
      main: "#116be0",
      light: "#0f8bff",
      dark: "#116be0"
    },
    error: {
      main: red.A400
    },
    background: {
      default: "#fff",
      paper: "#293640"
    },
    text: {
      primary: "#fff",
      secondary: "#9aa3ad"
    }
  },
  typography: {
    h6: {
      fontWeight: 400
    }
  }
});

console.log(theme);

export default theme;
