import React from "react";
import ReactGA from "react-ga";
import { Grid } from "@mui/material";
import MainStats from "../../components/stats";

export default function Stats() {
  React.useEffect(() => {
    ReactGA.event({
      category: "User",
      action: "Stats Page Visited",
    });
  }, []);
  return (
    <>
      <Grid container spacing={3} marginTop={2}>
        <Grid item xs={0.5}></Grid>
        <Grid item xs={11}>
          <Grid container spacing={3}>
            <MainStats />
          </Grid>
        </Grid>
        <Grid item xs={0.5}></Grid>
      </Grid>
    </>
  );
}
