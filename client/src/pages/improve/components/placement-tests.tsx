import React from "react";
import { useGameSettings } from "contexts/GameSettings";
import { useAuth } from "contexts/AuthContext";

import { DefaultImproveGameSettings } from "constants/settings";
import StandardGame from "components/standard-game";

import KeyboardIcon from "@mui/icons-material/Keyboard";
import InfoIcon from "@mui/icons-material/Info";
import { Box, Button, Divider, Grid, Typography } from "@mui/material";

interface PlacementTestsProps {
  completed: number;
  onDashboardPress: () => void;
}

export default function PlacementTests({
  completed,
  onDashboardPress,
}: PlacementTestsProps) {
  const { currentUser } = useAuth();

  const { gameSettings } = useGameSettings();

  return (
    <Box
      display="flex"
      position="relative"
      flexDirection="column"
      gap={1}
      textAlign="center"
    >
      <Typography variant="h2" color="primary">
        Placement Tests
      </Typography>
      <Button variant="text" disabled>
        <Box>
          <KeyboardIcon
            fontSize="large"
            sx={{ transform: "scale(1.5)", m: 1 }}
          />
          <Typography variant="h6">{completed} / 10 Completed</Typography>
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

      <Box mt={15}>
        <Button variant="contained" size="large" onClick={onDashboardPress}>
          Back
        </Button>
      </Box>

      <Divider sx={{ mt: 10 }} />
    </Box>
  );
}
