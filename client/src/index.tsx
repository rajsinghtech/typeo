import React from "react";
import ReactDOM from "react-dom";
import ReactGA from "react-ga";
import Router from "config/Router";
import { AuthProvider } from "contexts/AuthContext";
import { GameSettingsProvider } from "contexts/GameSettings";
import { SocketProvider } from "contexts/SocketContext";
import { StatsProvider } from "contexts/StatsContext";
import { SnackbarProvider } from "notistack";
import CssBaseline from "@mui/material/CssBaseline";
import {
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xs: true;
    vs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

const TRACKING_ID = "UA-230352416-1";
ReactGA.initialize(TRACKING_ID);

let theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#F9252B",
    },
    secondary: {
      main: "#ffffff",
      // second: "#e25048",
      // third: "#8fcf39",
      // highlight: "rgba(255,0,0,0.8)",
    },
    info: {
      main: "#2D7FE5",
    },
    error: {
      main: "#ff1212",
    },
    background: {
      default: "#181B24",
      paper: "#242635",
      //incorrect: "rgba(255,0,0,0.25)",
    },
    grey: {
      900: "#182024",
    },
    //solid: {
    //main: "#ff0000",
    //},
    text: {
      secondary: "#999ea3",
    },
    //textColor: {
    //none: "#999ea3",
    //correct: "#ffffff",
    //incorrect: "#ff0000",
    // },
  },
  typography: {
    fontFamily: ['"Overpass"', "sans-serif"].join(","),
    body1: {
      letterSpacing: "0.1rem",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      vs: 600,
      sm: 900,
      md: 1325,
      lg: 1500,
      xl: 1600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "&::-webkit-scrollbar": {
            width: 7,
            height: 7,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            borderRadius: "5px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#dfdfdf",
            borderRadius: "5px",
          },
        },
        div: {
          "&::-webkit-scrollbar": {
            width: 7,
            height: 7,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            borderRadius: "5px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#dfdfdf",
            borderRadius: "5px",
          },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

ReactDOM.render(
  <AuthProvider>
    <SocketProvider>
      <ThemeProvider theme={theme}>
        <GameSettingsProvider>
          <StatsProvider>
            <CssBaseline />
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <Router />
              {/* <ChatBox /> */}
            </SnackbarProvider>
          </StatsProvider>
        </GameSettingsProvider>
      </ThemeProvider>
    </SocketProvider>
  </AuthProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
