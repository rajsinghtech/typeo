import React from "react";
import { useGameSettings } from "contexts/GameSettings";

import { DefaultImproveGameSettings } from "constants/settings";
import StandardGame from "components/standard-game";

import KeyboardIcon from "@mui/icons-material/Keyboard";
import { Box, Button, Grid, StepContent, Typography } from "@mui/material";

export default function PlacementTests() {
  const { gameSettings } = useGameSettings();

  return (
    <StepContent>
      <Typography>
        These will determine your starting point and gather information about
        your weaknesses.
      </Typography>
      <Box sx={{ mb: 2 }}>
        <div style={{ textAlign: "center" }}>
          <Button variant="text" disabled sx={{ p: 2, my: 2 }}>
            <Box>
              <KeyboardIcon
                fontSize="large"
                sx={{ transform: "scale(1.5)", m: 1 }}
              />
              <Typography variant="h6">0 / 10 Completed</Typography>
            </Box>
          </Button>
          <Grid container spacing={3}>
            <StandardGame
              settings={{
                ...DefaultImproveGameSettings,
                display: {
                  ...gameSettings.display,
                  showProfile: false,
                },
              }}
            />
          </Grid>
        </div>
      </Box>
    </StepContent>
  );
}
