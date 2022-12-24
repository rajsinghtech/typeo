import React from "react";
import { TextVariant } from "constants/common";
import { Box, Typography, Slider } from "@mui/material";

interface LPWLProps {
  label?: number | string;
  value: number;
  step: number;
  fillColor: string;
  labelTextVariant?: TextVariant;
}

export function LinearProgressWithLabel({
  label,
  value,
  step,
  fillColor,
  labelTextVariant,
}: LPWLProps) {
  return (
    <Box display="flex" gap={3}>
      <Slider
        sx={{
          "& .MuiSlider-track": {
            color: fillColor,
          },
          "& .MuiSlider-thumb": {
            color: fillColor,
          },
          flex: 5,
        }}
        defaultValue={0}
        value={value}
        step={step}
        marks
        min={0}
        max={100}
        disabled
      />
      {label && (
        <Typography
          variant={labelTextVariant || "h5"}
          color="textSecondary"
          textOverflow="clip"
          noWrap
          flex={1}
        >
          {label}
        </Typography>
      )}
    </Box>
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
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "row", sm: "column" },
          justifyContent: "center",
          alignItems: "center",
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Typography>{"WPM "}</Typography>
        <Typography ref={textRef} variant="h5">
          0
        </Typography>
      </Box>
    );
  }, []);

  return <>{Display}</>;
});

export function calculateAccuracyColor(
  accuracy: number,
  opacity: number
): string {
  const green = Math.floor(((clamp(accuracy, 85, 100) - 85) / 15) * 255);
  const red = 255 - green;
  return `rgba(${red},${green},65, ${opacity})`;
}

export function calculateWPMColor(wpm: number, opacity: number): string {
  const green = Math.floor(((clamp(wpm, 30, 170) - 30) / 140) * 255);
  const red = 255 - green;
  return `rgba(${red},${green},65, ${opacity})`;
}

export function clamp(num: number, min: number, max: number): number {
  return num <= min ? min : num >= max ? max : num;
}
