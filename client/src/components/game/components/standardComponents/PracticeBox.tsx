import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import MissedSequences from "../../../stats/components/MissedSequences";
import StatKeyboard from "../../../stats/components/StatKeyboard";

export default function PracticeBox() {
  return (
    <Box sx={{ my: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={7}>
          <StatKeyboard title="Keys" interactive />
        </Grid>
        <Grid item xs={5}>
          <MissedSequences interactive />
        </Grid>
      </Grid>
    </Box>
  );
}
