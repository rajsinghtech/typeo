import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import MissedSequences from "../../../stats/components/MissedSequences";
import StatKeyboard from "../../../stats/components/StatKeyboard";

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
