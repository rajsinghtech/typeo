import React from "react";
import { Timeframes } from "constants/stats";
import { SelectMenu } from "components/common";
import { SelectChangeEvent } from "@mui/material";

interface TimeframeSelectProps {
  timeframe: number;
  handleTimeframeChange: (event: SelectChangeEvent) => void;
}
export default function TimeframeSelect({
  timeframe,
  handleTimeframeChange,
}: TimeframeSelectProps) {
  return (
    <SelectMenu
      value={timeframe}
      handleValueChange={handleTimeframeChange}
      options={[
        { name: "All Time", value: Timeframes.ALL_TIME },
        { name: "Last 100 Races", value: Timeframes.LAST_100 },
        { name: "Last 50 Races", value: Timeframes.LAST_50 },
        { name: "Last 25 Races", value: Timeframes.LAST_25 },
        { name: "Last 10 Races", value: Timeframes.LAST_10 },
      ]}
      label="Timeframe"
    />
  );
}
