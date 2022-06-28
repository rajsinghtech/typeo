import React from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from "@mui/material";
import { GridCard } from "../../common";
import { useGameSettings } from "../../../contexts/GameSettings";
import { Timeframes } from "../../../constants/stats";
import { useStats } from "../../../contexts/StatsContext";

interface StatKeyboardProps {
  title: string;
  data?: number[];
  interactive?: boolean;
}

export default function StatKeyboard({
  title,
  data,
  interactive,
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
    const newKeySpeeds = getKeySpeeds(timeframe);
    const filteredSpeeds = newKeySpeeds.filter((wpm) => wpm !== 0);

    setKeySpeeds(newKeySpeeds);
    setMin(Math.min(...filteredSpeeds));
    setMax(Math.min(Math.max(...filteredSpeeds), 220));
  }, [timeframe, getKeySpeeds]);

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
          color={inPracticeStrings ? "primary" : "secondary"}
          id={keyboardKey}
          sx={{
            minHeight: 50,
            minWidth: 50,
            m: 1,
            textTransform: "none",
            borderColor: keySpeed
              ? calculateKeySpeedColor(keySpeed, min, max, 1)
              : "inherit",
            borderWidth: inPracticeStrings ? 3 : 1,
            backgroundColor: keySpeed
              ? inPracticeStrings
                ? "secondary.main"
                : calculateKeySpeedColor(keySpeed, min, max, 0.3)
              : "inherit",
            "&:hover": {
              backgroundColor: keySpeed
                ? inPracticeStrings
                  ? "secondary.main"
                  : calculateKeySpeedColor(keySpeed, min, max, 0.3)
                : "inherit",
              borderColor: keySpeed
                ? calculateKeySpeedColor(keySpeed, min, max, 1)
                : "inherit",
              borderWidth: inPracticeStrings ? 3 : 1,
              opacity: 0.8,
            },
          }}
          onClick={
            interactive
              ? () => togglePracticeStringsValue(keyboardKey)
              : () => null
          }
        >
          <Typography>{keyboardKey}</Typography>
        </Button>
      </Tooltip>
    );
  };

  return (
    <>
      {!data ? (
        <FormControl variant="standard" sx={{ minWidth: 200, mb: 3 }}>
          <InputLabel id="keyspeed-timeframe-label">Timeframe</InputLabel>
          <Select
            label="Timeframe"
            labelId="keyspeed-timeframe-label"
            value={`${timeframe}`}
            onChange={handleTimeframeChange}
          >
            <MenuItem value={Timeframes.ALL_TIME}>All Time</MenuItem>
            <MenuItem value={Timeframes.LAST_100}>Last 100 Races</MenuItem>
            <MenuItem value={Timeframes.LAST_50}>Last 50 Races</MenuItem>
            <MenuItem value={Timeframes.LAST_25}>Last 25 Races</MenuItem>
            <MenuItem value={Timeframes.LAST_10}>Last 10 Races</MenuItem>
          </Select>
        </FormControl>
      ) : null}
      <GridCard sx={{ textAlign: "center" }}>
        <Typography variant="h5" pb={2}>
          {title}
        </Typography>
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
