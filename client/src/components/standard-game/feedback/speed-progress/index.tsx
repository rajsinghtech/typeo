import React from "react";
import { TextVariant } from "constants/common";
import { Box, Grid, Typography, LinearProgress } from "@mui/material";

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
    <>
      <LinearProgress
        value={value}
        variant="determinate"
        color="secondary"
        sx={{
          "& .MuiLinearProgress-bar1Determinate": {
            background: fillColor,
            borderRight: "1px solid black",
          },
          display: "inline-block",
        }}
      />
      <Typography variant={labelTextVariant || "h5"} color="textSecondary">
        {label}
      </Typography>
    </>
  );
}

interface SpeedProgressProps {
  wpm: number;
}

export default React.memo(function SpeedProgress({ wpm }: SpeedProgressProps) {
  const textRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (textRef.current) {
      const heading = textRef.current as HTMLHeadingElement;
      heading.innerText = `${wpm}`;
      heading.style.color = wpm === 0 ? "white" : calculateWPMColor(wpm, 0.9);
    }
  }, [wpm]);

  const Display = React.useMemo(() => {
    return (
      <Grid item xs={2}>
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography>{"WPM "}</Typography>
          <Typography ref={textRef} variant="h4">
            0
          </Typography>
        </Box>
      </Grid>
    );
  }, []);

  return <>{Display}</>;
});

export function calculateWPMColor(wpm: number, opacity: number): string {
  const green = Math.floor(((clamp(wpm, 30, 170) - 30) / 140) * 255);
  const red = 255 - green;
  return `rgba(${red},${green},65, ${opacity})`;
}

function clamp(num: number, min: number, max: number): number {
  return num <= min ? min : num >= max ? max : num;
}
