import React from "react";
import MissedSequences from "components/stats/missed-sequences";
import StatKeyboard from "components/stats/stat-keyboard";
import { Grid } from "@mui/material";

export default function PracticeBox() {
  return (
    <>
      <Grid item xs={1}></Grid>
      <Grid item xs={6}>
        <StatKeyboard title="Keys" interactive />
      </Grid>
      <Grid item xs={4}>
        <MissedSequences interactive />
      </Grid>
      <Grid item xs={1}></Grid>
    </>
  );
}
