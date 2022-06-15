import React from "react";
import PropTypes from "prop-types";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { TextVariant } from "../../../constants/common";
import { Box } from "@mui/material";

const PREFIX = "SpeedProgress";

interface LPWLProps {
  label: number | string;
  value: number;
  fillColor: string;
  labelTextVariant?: TextVariant;
}

export function LinearProgressWithLabel({
  label,
  value,
  fillColor,
  labelTextVariant,
}: LPWLProps) {
  return (
    <Grid container spacing={3} alignItems="center">
      <Grid item xs={10}>
        <LinearProgress
          value={value}
          variant="determinate"
          color="secondary"
          sx={{
            "& .MuiLinearProgress-bar1Determinate": {
              background: fillColor,
              borderRight: "1px solid black",
            },
          }}
        />
      </Grid>
      <Grid item xs={2}>
        <Typography variant={labelTextVariant || "h5"} color="textSecondary">
          {label}
        </Typography>
      </Grid>
    </Grid>
  );
}

interface SpeedProgressProps {
  wpm: number;
  sidePadding?: number;
}

export default function SpeedProgress({
  wpm,
  sidePadding,
}: SpeedProgressProps) {
  return (
    <Box sx={{ width: "100%", padding: `0px ${sidePadding}` }}>
      <Grid container spacing={3}>
        <Grid item xs={2}></Grid>
        <Grid item xs={8}>
          <LinearProgressWithLabel
            label={wpm}
            value={clamp((wpm / 200) * 100, 0, 100)}
            fillColor={calculateWPMColor(wpm, 1)}
          />
        </Grid>
        <Grid item xs={2}></Grid>
      </Grid>
    </Box>
  );
}

export function calculateWPMColor(wpm: number, opacity: number): string {
  const green = Math.floor(((clamp(wpm, 30, 170) - 30) / 140) * 255);
  const red = 255 - green;
  return `rgba(${red},${green},0, ${opacity})`;
}

function clamp(num: number, min: number, max: number): number {
  return num <= min ? min : num >= max ? max : num;
}
