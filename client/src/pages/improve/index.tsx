import React, { useEffect, useState } from "react";
import { useAuth } from "contexts/AuthContext";
import { db } from "config/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { GridCard, ErrorAlert } from "components/common";
import PlacementTests from "./steps/placement-tests";
import CustomizedTests from "./steps/customized-tests";

import {
  Box,
  Divider,
  Step,
  Stepper,
  StepButton,
  StepLabel,
  Typography,
} from "@mui/material";

export default function Improve() {
  const [activeStep, setActiveStep] = React.useState(0);

  const { isLoggedIn, currentUser } = useAuth();

  const [completed, setCompleted] = useState(0);

  const handleStep = (step: number) => () => {
    if (isLoggedIn) {
      setActiveStep(step);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const q = query(
      collection(db, "users", currentUser.uid, "improvement_races"),
      limit(10),
      orderBy("timestamp", "desc")
    );
    onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      if (!isMounted || snapshot.docChanges().length <= 0) return;
      console.log(snapshot.size);
      setCompleted(snapshot.size);
    });

    return () => {
      isMounted = false;
    };
  }, []);

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
              <Step key={index}>
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
                {/* CONTENT */}
                <step.component />
              </Step>
            ))}
          </Stepper>
        </Box>
      </GridCard>
    </Box>
  );
}

const steps = [
  {
    label: "Complete 10 Placement Tests",
    description: `These will determine your starting point and gather information about your 
                  weaknesses.`,
    component: PlacementTests,
  },
  {
    label: "Practice Customized Tests",
    description: `There will be 5 different tests covering your weakest character sequences and letters. You need to average 10 WPM above your baseline
      to be eligible to test out of the category. Once you are eligible, you can test out by completing 10 tests and
      averaging 10 WPM above your baseline.`,
    component: CustomizedTests,
  },
  {
    label: "Test Your Improvement",
    description: `See how much you improvement by taking 10 tests (same as placement tests).`,
    component: PlacementTests,
  },
];
