import React from "react";
import { GridCard } from "components/common";
import { useGameSettings } from "contexts/GameSettings";
import {
  CharacterStats,
  CharacterStatsMap,
  DefaultStatFilters,
  StatFilters,
  Timeframes,
} from "constants/stats";
import { useStats } from "contexts/StatsContext";
import SpeedIcon from "@mui/icons-material/Speed";
import { Box, Button, Tooltip, Typography } from "@mui/material";

interface StatKeyboardProps {
  title: string;
  data?: CharacterStatsMap;
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
  const [timeframe] = React.useState<number>(Timeframes.LAST_100);
  const [keyStatsMap, setKeyStatsMap] = React.useState<CharacterStatsMap>(
    data || new Map()
  );

  const [min, setMin] = React.useState<number>(
    data ? minOfCharacterStatsMap(keyStatsMap) : 0
  );
  const [max, setMax] = React.useState<number>(
    data ? Math.min(maxOfCharacterStatsMap(keyStatsMap), 220) : 0
  );

  const parentRef = React.useRef<HTMLDivElement>(null);

  const { getKeyStatsMap } = useStats();

  React.useEffect(() => {
    if (data) return;
    const newKeyStats = getKeyStatsMap(
      filters || { ...DefaultStatFilters, timeframe }
    );

    setKeyStatsMap(newKeyStats);
    setMin(minOfCharacterStatsMap(newKeyStats));
    setMax(Math.min(maxOfCharacterStatsMap(newKeyStats), 220));
  }, [filters, timeframe, getKeyStatsMap]);

  return (
    <>
      {new Array(27).fill(0).map((_, i) => {
        return (
          <Box
            id={`key_arrow_${i}`}
            key={`key_arrow_${i}`}
            position="absolute"
            height="2px"
            zIndex={999}
            width="0px"
            sx={{
              transition: "all 0.3s ease",
              transformOrigin: "0 0",
              backgroundColor: calculateKeySpeedColor(
                Math.random() * 300,
                min,
                max,
                1
              ),
              pointerEvents: "none",
            }}
          />
        );
      })}
      <GridCard noBorder={noBorder} sx={{ textAlign: "center" }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box display="flex" gap={2}>
            <SpeedIcon color="secondary" />
            <Typography variant="subtitle1">{title}</Typography>
          </Box>
          {/* {!filters ? (
            <TimeframeSelect
              timeframe={timeframe}
              handleTimeframeChange={handleTimeframeChange}
            />
          ) : null} */}
        </Box>
        <Box ref={parentRef} position="relative">
          {["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map((val) => (
            <KeyboardButton
              key={`${val}_key`}
              keyboardKey={val}
              keyStats={keyStatsMap.get(val)}
              min={min}
              max={max}
              interactive={interactive}
            />
          ))}
        </Box>
        <Box>
          {["a", "s", "d", "f", "g", "h", "j", "k", "l"].map((val) => (
            <KeyboardButton
              key={`${val}_key`}
              keyboardKey={val}
              keyStats={keyStatsMap.get(val)}
              min={min}
              max={max}
              interactive={interactive}
            />
          ))}
        </Box>
        <Box>
          {["z", "x", "c", "v", "b", "n", "m"].map((val) => (
            <KeyboardButton
              key={`${val}_key`}
              keyboardKey={val}
              keyStats={keyStatsMap.get(val)}
              min={min}
              max={max}
              interactive={interactive}
            />
          ))}
        </Box>
        <Box>
          <KeyboardButton
            keyboardKey="space"
            keyStats={keyStatsMap.get(" ")}
            min={min}
            max={max}
            widthPercentage={50}
            interactive={interactive}
          />
        </Box>
      </GridCard>
    </>
  );
}

interface KeyboardButtonProps {
  keyboardKey: string;
  min: number;
  max: number;
  keyStats?: CharacterStats;
  widthPercentage?: number;
  interactive?: boolean;
}

const KeyboardButton = ({
  keyboardKey,
  keyStats,
  min,
  max,
  widthPercentage,
  interactive,
}: KeyboardButtonProps) => {
  const { gameSettings, setGameSettings } = useGameSettings();

  const { wpm, frequency, misses } = keyStats || {
    wpm: 0,
    frequency: 0,
    misses: 0,
  };

  const inPracticeStrings =
    gameSettings.gameInfo.practice.practiceStrings.includes(keyboardKey) &&
    interactive;

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

  const drawLines = React.useCallback(() => {
    const rootElement = document.getElementById(keyboardKey);
    if (!rootElement) return;
    const boundingRect = rootElement.getBoundingClientRect();
    const rootX = window.scrollX + boundingRect.left + boundingRect.width / 2;
    const rootY = window.scrollY + boundingRect.top + boundingRect.height / 2;

    for (let i = 0; i < 27; i++) {
      const elementId = i === 26 ? "space" : String.fromCharCode(i + 97);
      const element = document.getElementById(elementId);
      if (!element) continue;
      const boundingRect = element.getBoundingClientRect();
      const elementX =
        window.scrollX + boundingRect.left + boundingRect.width / 2;
      const elementY =
        window.scrollY + boundingRect.top + boundingRect.height / 2;

      const distance = Math.sqrt(
        (elementX - rootX) ** 2 + (elementY - rootY) ** 2
      );

      const angle = Math.atan2(elementY - rootY, elementX - rootX);
      const arrowElement = document.getElementById(`key_arrow_${i}`);
      if (!arrowElement) continue;
      arrowElement.style.transform = `rotate(${angle}rad)`;
      arrowElement.style.top = `${rootY}px`;
      arrowElement.style.left = `${rootX}px`;
      arrowElement.style.width = `${distance}px`;
    }
  }, []);

  const removeLines = React.useCallback(() => {
    for (let i = 0; i < 27; i++) {
      const arrowElement = document.getElementById(`key_arrow_${i}`);
      if (!arrowElement) continue;
      arrowElement.style.width = `0px`;
    }
  }, []);

  return (
    <Tooltip
      title={
        wpm
          ? `WPM: ${wpm.toFixed(1)}, Frequency: ${frequency}, Accuracy: ${(
              ((frequency - misses) / frequency) *
              100
            ).toFixed(1)}%`
          : "None"
      }
      placement="top"
      arrow
      disableInteractive
      componentsProps={{
        tooltip: { style: { background: "rgba(100, 100, 100, 0.8)" } },
      }}
    >
      <Button
        variant="outlined"
        color="secondary"
        id={keyboardKey}
        sx={{
          position: "relative",
          minWidth: widthPercentage ? `${widthPercentage}%` : "6%",
          padding: 0,
          paddingTop: "6%",
          height: 0,
          m: { xs: 0.5, vs: 0.9 },
          textTransform: "none",
          borderColor: calculateKeySpeedColor(wpm, min, max, 1),
          borderWidth: 1,
          backgroundColor: inPracticeStrings
            ? "primary.main"
            : calculateKeySpeedColor(wpm, min, max, 0.3),
          "&:hover": {
            backgroundColor: inPracticeStrings
              ? "primary.main"
              : calculateKeySpeedColor(wpm, min, max, 0.3),
            borderColor: calculateKeySpeedColor(wpm, min, max, 1),
            borderWidth: 1,
            opacity: 0.8,
          },
        }}
        onClick={
          interactive
            ? () => togglePracticeStringsValue(keyboardKey)
            : () => null
        }
        onMouseOver={drawLines}
        onMouseLeave={removeLines}
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

export function calculateKeySpeedColor(
  wpm: number,
  min: number,
  max: number,
  opacity: number
): string {
  if (wpm === 0) return "inherit";
  const limitWpm = Math.min(wpm, 220);
  const percentage = (limitWpm - min) / (max - min);
  const red = (1 - percentage) * 255 + 50;
  const green = percentage * 255 + 50;
  return `rgb(${red},${green},80, ${opacity})`;
}

const minOfCharacterStatsMap = (map: Map<string, CharacterStats>) => {
  let min = Infinity;
  map.forEach((value) => {
    if (value.wpm < min) min = value.wpm;
  });
  return min;
};

const maxOfCharacterStatsMap = (map: Map<string, CharacterStats>) => {
  let max = -Infinity;
  map.forEach((value) => {
    if (value.wpm > max) max = value.wpm;
  });
  return max;
};
