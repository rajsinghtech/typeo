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
} from "@mui/material";

export default function StartMenu({
  setStatus,
}: {
  setStatus: React.Dispatch<React.SetStateAction<DefenderStatus>>;
}) {
  const { gameSettings, setGameSettings } = useGameSettings();

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
      gap={5}
    >
      <Typography variant="h1" color="text.primary">
        Defender
      </Typography>
      <Typography variant="subtitle1">
        Tip: Press CTRL to go to next enemy
      </Typography>
      <ToggleButtonGroup
        value={gameSettings.defender.difficulty}
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
