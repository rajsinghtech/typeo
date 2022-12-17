import React from "react";
import {
  Box,
  Typography,
  Divider,
  Step,
  StepButton,
  Stepper,
  StepContent,
  StepLabel,
  Button,
} from "@mui/material";

const steps = [
  {
    label: "Complete 10 Placement Tests",
    description: `These will determine your starting point and gather information about your typing habits.`,
  },
  {
    label: "Practice Customized Tests",
    description: `These will help you improve your typing skills.`,
  },
  {
    label: "Complete All Categories",
    description: `If you can average a 5 WPM increase in a category (Over 10 Tests), you can test out of it. You can also skip categories if you do not feel it is helpful.`,
  },
  {
    label: "Test Your Overall Improvement",
    description: `This will test your overall typing speed and set your new baseline`,
  },
  {
    label: "Repeat",
    description: `You can repeat the process as many times as you want to improve your typing speed.`,
  },
];

interface AboutImprovementProps {
  onStartButtonPress: () => void;
}

export default function AboutImprovement({
  onStartButtonPress,
}: AboutImprovementProps) {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  return (
    <Box
      display="flex"
      position="relative"
      flexDirection="column"
      gap={1}
      textAlign="center"
    >
      <Typography variant="h2" color="primary">
        Improve Your Typing
      </Typography>
      <Typography variant="subtitle1">
        Welcome To Improvement. If you are trying to get faster at typing then
        you are in the right place.
      </Typography>
      <Box marginTop={10}>
        <Typography mb={8} fontStyle="italic">
          (Click on each step for more info)
        </Typography>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          nonLinear
          sx={{ height: "300px" }}
        >
          {steps.map(({ label, description }, index) => (
            <Step key={label}>
              <StepButton color="inherit" onClick={handleStep(index)}>
                <Typography variant="subtitle1">{label}</Typography>
              </StepButton>
              <StepContent sx={{ border: "none", padding: 2 }}>
                <Typography color="primary.light">{description}</Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        <Button
          variant="contained"
          sx={{
            paddingX: 3,
            paddingY: 2,
            fontSize: "1.25em",
          }}
          onClick={onStartButtonPress}
        >
          Start Placement Tests
        </Button>
        <Divider sx={{ mt: 10 }} />
      </Box>
    </Box>
  );
}
