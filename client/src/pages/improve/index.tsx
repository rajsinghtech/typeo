import React from "react";
import { useAuth } from "contexts/AuthContext";
import { useGameSettings } from "contexts/GameSettings";
import { DefaultImproveGameSettings } from "constants/settings";
import StandardGame from "components/standard-game";
import { GridCard, ErrorAlert } from "components/common";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import {
  Box,
  Button,
  Divider,
  Grid,
  Step,
  Stepper,
  StepButton,
  StepLabel,
  StepContent,
  Typography,
} from "@mui/material";

const steps = [
  {
    label: "Complete 10 Placement Tests",
    description: `These will determine your starting point and gather information about your 
                  weaknesses.`,
  },
  {
    label: "Practice Customized Tests",
    description: `There will be 5 different tests covering your weakest character sequences and letters. You need to average 10 WPM above your baseline
      to be eligible to test out of the category. Once you are eligible, you can test out by completing 10 tests and
      averaging 10 WPM above your baseline.`,
  },
  {
    label: "Test Your Improvement",
    description: `See how much you improvement by taking 10 tests (same as placement tests).`,
  },
];

export default function Improve() {
  const [activeStep, setActiveStep] = React.useState(0);

  const { isLoggedIn } = useAuth();
  const { gameSettings } = useGameSettings();

  const handleStep = (step: number) => () => {
    if (isLoggedIn) {
      setActiveStep(step);
    }
  };

  return (
    <Box>
      <GridCard padding="30px" sx={{ backgroundColor: "background.default" }}>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h3" color="secondary">
            Improve Your Typing
          </Typography>
          <Typography variant="subtitle1">
            Welcome To Improvement. If you are trying to get faster at typing
            then you are in the right place.
          </Typography>
          <Typography></Typography>
          <Divider />
          <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepButton onClick={handleStep(index)}>
                  <StepLabel error={!isLoggedIn}>
                    <Typography>{step.label}</Typography>
                    {!isLoggedIn && index === 0 ? (
                      <ErrorAlert>
                        <Typography>
                          You must be logged in to access this feature. Please
                          login or create a free account
                        </Typography>
                      </ErrorAlert>
                    ) : null}
                  </StepLabel>
                </StepButton>
                <StepContent>
                  <Typography>{step.description}</Typography>
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
              </Step>
            ))}
          </Stepper>
        </Box>
      </GridCard>
    </Box>
  );
}
