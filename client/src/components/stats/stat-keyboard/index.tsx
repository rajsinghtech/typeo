import React from "react";
import { GridCard } from "components/common";
import { useGameSettings } from "contexts/GameSettings";
import { DefaultStatFilters, StatFilters, Timeframes } from "constants/stats";
import { useStats } from "contexts/StatsContext";
import TimeframeSelect from "components/stats/timeframe-select";
import SpeedIcon from "@mui/icons-material/Speed";
import {
  Box,
  Button,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from "@mui/material";

interface StatKeyboardProps {
  title: string;
  data?: number[];
  filters?: StatFilters;
  interactive?: boolean;
  noBorder?: boolean;
}

export default function StatKeyboard({
  title,
  data,
  filters,
  interactive,
  noBorder,
}: StatKeyboardProps) {
  const [timeframe, setTimeframe] = React.useState<number>(Timeframes.LAST_100);
  const [keySpeeds, setKeySpeeds] = React.useState<number[]>(
    data || new Array(26).fill(0)
  );

  const [min, setMin] = React.useState<number>(
    data ? Math.min(...data.filter((wpm) => wpm !== 0)) : 0
  );
  const [max, setMax] = React.useState<number>(
    data ? Math.min(Math.max(...data.filter((wpm) => wpm !== 0)), 220) : 0
  );

  const { gameSettings, setGameSettings } = useGameSettings();

  const { getKeySpeeds } = useStats();

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    const newTimeframe = parseInt(event.target.value);
    setTimeframe(newTimeframe);
  };

  const togglePracticeStringsValue = (value: string) => {
    const practiceStrings = gameSettings.gameInfo.practice.practiceStrings;
    const keyIndex = practiceStrings.indexOf(value);
    if (keyIndex === -1) {
      practiceStrings.push(value);
    } else {
      practiceStrings.splice(keyIndex, 1);
    }

    setGameSettings({
      ...gameSettings,
      gameInfo: {
        ...gameSettings.gameInfo,
        practice: { ...gameSettings.gameInfo.practice, practiceStrings },
      },
    });
  };

  React.useEffect(() => {
    if (data) return;
    const newKeySpeeds = getKeySpeeds(
      filters || { ...DefaultStatFilters, timeframe }
    );
    const filteredSpeeds = newKeySpeeds.filter((wpm) => wpm !== 0);

    setKeySpeeds(newKeySpeeds);
    setMin(Math.min(...filteredSpeeds));
    setMax(Math.min(Math.max(...filteredSpeeds), 220));
  }, [filters, timeframe, getKeySpeeds]);

  const KeyboardButton = ({
    keyboardKey,
    keySpeed,
  }: {
    keyboardKey: string;
    keySpeed: number;
  }) => {
    const inPracticeStrings =
      gameSettings.gameInfo.practice.practiceStrings.includes(keyboardKey) &&
      interactive;
    return (
      <Tooltip
        title={keySpeed ? `WPM: ${keySpeed.toFixed(1)}` : "None"}
        placement="top"
      >
        <Button
          variant="outlined"
          color="secondary"
          id={keyboardKey}
          sx={{
            position: "relative",
            minWidth: "6%",
            padding: 0,
            paddingTop: "6%",
            height: 0,
            m: { xs: 0.5, vs: 0.9 },
            textTransform: "none",
            borderColor: keySpeed
              ? calculateKeySpeedColor(keySpeed, min, max, 1)
              : "inherit",
            borderWidth: 1,
            backgroundColor: keySpeed
              ? inPracticeStrings
                ? "primary.main"
                : calculateKeySpeedColor(keySpeed, min, max, 0.3)
              : "inherit",
            "&:hover": {
              backgroundColor: keySpeed
                ? inPracticeStrings
                  ? "primary.main"
                  : calculateKeySpeedColor(keySpeed, min, max, 0.3)
                : "inherit",
              borderColor: keySpeed
                ? calculateKeySpeedColor(keySpeed, min, max, 1)
                : "inherit",
              borderWidth: 1,
              opacity: 0.8,
            },
          }}
          onClick={
            interactive
              ? () => togglePracticeStringsValue(keyboardKey)
              : () => null
          }
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Typography>{keyboardKey}</Typography>
          </Box>
        </Button>
      </Tooltip>
    );
  };

  return (
    <>
      <GridCard noBorder={noBorder} sx={{ textAlign: "center" }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box display="flex" gap={2}>
            <SpeedIcon color="secondary" />
            <Typography variant="subtitle1">{title}</Typography>
          </Box>
          {!filters ? (
            <TimeframeSelect
              timeframe={timeframe}
              handleTimeframeChange={handleTimeframeChange}
            />
          ) : null}
        </Box>
        <Box>
          {["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map((val) => (
            <KeyboardButton
              key={`${val}_key`}
              keyboardKey={val}
              keySpeed={keySpeeds[val.charCodeAt(0) - 97]}
            />
          ))}
        </Box>
        <Box>
          {["a", "s", "d", "f", "g", "h", "j", "k", "l"].map((val) => (
            <KeyboardButton
              key={`${val}_key`}
              keyboardKey={val}
              keySpeed={keySpeeds[val.charCodeAt(0) - 97]}
            />
          ))}
        </Box>
        <Box>
          {["z", "x", "c", "v", "b", "n", "m"].map((val) => (
            <KeyboardButton
              key={`${val}_key`}
              keyboardKey={val}
              keySpeed={keySpeeds[val.charCodeAt(0) - 97]}
            />
          ))}
        </Box>
      </GridCard>
    </>
  );
}

export function calculateKeySpeedColor(
  wpm: number,
  min: number,
  max: number,
  opacity: number
): string {
  const limitWpm = Math.min(wpm, 220);
  const percentage = (limitWpm - min) / (max - min);
  const red = (1 - percentage) * 255 + 50;
  const green = percentage * 255 + 50;
  return `rgb(${red},${green},80, ${opacity})`;
}
