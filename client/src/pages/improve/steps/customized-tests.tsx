import React, { useState } from "react";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { Box, Typography, StepContent, Button, Stack } from "@mui/material";

import { useGameSettings } from "contexts/GameSettings";

import { DefaultImproveGameSettings } from "constants/settings";

import { GridCard } from "components/common";
import StandardGame from "components/standard-game";

export default function CustomizedTests() {
  const { gameSettings } = useGameSettings();

  const [tests] = useState<number[]>([1, 2, 3, 4, 5]);
  const [activeTest, setActiveTest] = useState<number>(0);

  console.log(activeTest);

  if (activeTest === 0) {
    return (
      <StepContent>
        <Box display="flex" gap={5}>
          {tests.map((item) => (
            <CustomizedTest
              key={item}
              id={item}
              setActiveTest={setActiveTest}
            />
          ))}
        </Box>
      </StepContent>
    );
  }

  return (
    <StepContent>
      <Button
        sx={{ marginBottom: 2 }}
        variant="outlined"
        onClick={() => setActiveTest(0)}
        startIcon={<KeyboardBackspaceIcon />}
      >
        Back
      </Button>
      <Box display="flex" gap={5}>
        <StandardGame
          settings={{
            ...DefaultImproveGameSettings,
            display: {
              ...gameSettings.display,
              showProfile: false,
            },
          }}
        />
      </Box>
    </StepContent>
  );
}

interface CustomizedTestProps {
  id: number;
  setActiveTest: (id: number) => void;
}

export function CustomizedTest({ id, setActiveTest }: CustomizedTestProps) {
  return (
    <Stack textAlign="center">
      <Typography variant="h6" color="success.main">
        Speed: 96
      </Typography>
      <GridCard textalign="center">
        <Stack spacing={5}>
          <Typography variant="body1">Lorem ipsum.</Typography>

          <Typography variant="h6">Accuracy: 96</Typography>

          <Button variant="contained" onClick={() => setActiveTest(id)}>
            Train
          </Button>
        </Stack>
      </GridCard>
    </Stack>
  );
}
