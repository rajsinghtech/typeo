import React from "react";
import { DefenderStatus } from "components/defender";
import { useGameSettings } from "contexts/GameSettings";
import { Difficulty } from "constants/settings";
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";

export default function StartMenu({
  setStatus,
}: {
  setStatus: React.Dispatch<React.SetStateAction<DefenderStatus>>;
}) {
  const { gameSettings, setGameSettings } = useGameSettings();

  const theme = useTheme();
  const vsScreenSize = useMediaQuery(theme.breakpoints.up("vs"));
  const SetDifficulty = (_: unknown, newDifficulty: Difficulty) => {
    setGameSettings({
      ...gameSettings,
      defender: { ...gameSettings.defender, difficulty: newDifficulty },
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      width="100%"
      height="100%"
      alignItems="center"
      textAlign="center"
      gap={5}
      px={1}
    >
      <Typography variant="h1" color="text.primary">
        Defender
      </Typography>
      <Typography variant="subtitle1">
        Tip: There is a bonus round every 7th round
      </Typography>
      <ToggleButtonGroup
        value={gameSettings.defender.difficulty}
        orientation={vsScreenSize ? "horizontal" : "vertical"}
        exclusive
        onChange={SetDifficulty}
      >
        <ToggleButton value="easy" color="success">
          Easy
        </ToggleButton>
        <ToggleButton value="medium" color="primary">
          Medium
        </ToggleButton>
        <ToggleButton value="hard" color="warning">
          Hard
        </ToggleButton>
        <ToggleButton value="impossible" color="error">
          Impossible
        </ToggleButton>
      </ToggleButtonGroup>
      <Button
        variant="outlined"
        color="secondary"
        sx={{ mt: 2 }}
        onClick={() => setStatus("running")}
      >
        Start
      </Button>
    </Box>
  );
}
