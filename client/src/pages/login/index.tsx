import React from "react";
import ReactGA from "react-ga";
import { Grid } from "@mui/material";

import LoginComponent from "../../components//profile/login";

export default function Login() {
  React.useEffect(() => {
    ReactGA.event({
      category: "User",
      action: "Login Page Visited",
    });
  }, []);
  return (
    <Grid container spacing={3}>
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <LoginComponent />
      </Grid>
      <Grid item xs={2}></Grid>
    </Grid>
  );
}
