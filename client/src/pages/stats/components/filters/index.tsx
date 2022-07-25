import React from "react";
import { MultipleSelectMenu } from "components/common";
import TimeframeSelect from "components/stats/timeframe-select";
import { GameTypeNames, GameTypes, TextTypeNames } from "constants/settings";
import { StatFilters } from "constants/stats";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Box, SelectChangeEvent } from "@mui/material";

interface FiltersProps {
  statFilters: StatFilters;
  handleTimeframeChange: (event: SelectChangeEvent) => void;
  handleGameModeChange: (event: SelectChangeEvent) => void;
  handleTextTypeChange: (event: SelectChangeEvent) => void;
}

export default function Filters({
  statFilters,
  handleTimeframeChange,
  handleGameModeChange,
  handleTextTypeChange,
}: FiltersProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <FilterAltIcon />
      <TimeframeSelect
        timeframe={statFilters.timeframe}
        handleTimeframeChange={handleTimeframeChange}
      />

      <MultipleSelectMenu
        value={statFilters.gameMode}
        handleValueChange={handleGameModeChange}
        options={GameTypeNames.slice(0, GameTypeNames.length - 1).map(
          (gameType, i) => ({
            name: gameType,
            value: i,
          })
        )}
        label="Mode"
      />
      <MultipleSelectMenu
        value={statFilters.textType}
        handleValueChange={handleTextTypeChange}
        options={TextTypeNames.map((textType, i) => ({
          name: textType,
          value: i,
        }))}
        label="Text Type"
      />
    </Box>
  );
}
