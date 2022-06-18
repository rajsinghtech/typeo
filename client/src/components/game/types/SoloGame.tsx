import React from "react";
import StandardGame from "../components/Standard";
import { useGameSettings } from "../../../contexts/GameSettings";
import { Box, Card, Grid, Typography } from "@mui/material";
import MissedSequences from "../../stats/components/MissedSequences";
import StatKeyboard from "../../stats/components/StatKeyboard";
import PracticeBox from "../components/standardComponents/PracticeBox";
import useRaceLogic from "../RaceLogic";
import Results from "../components/results/Results";
import HomeProfile from "../../profile/display/HomeProfile";
import TopSettings from "../components/standardComponents/TopSettings";
import Settings from "../components/standardComponents/Settings";

export default function SoloGame() {
  const { gameSettings } = useGameSettings();

  const { isPractice, practiceStrings } = gameSettings.gameInfo.practice;

  const TopSettingsDisplay = React.useMemo(
    () => (
      <Grid item xs={2} position="relative">
        <Box position="absolute" bottom={0} right={0}>
          <TopSettings />
        </Box>
      </Grid>
    ),
    [gameSettings]
  );

  const SettingsDisplay = React.useMemo(
    () => (
      <Grid item xs={2}>
        <Box mb={3}>
          <TopSettings />
        </Box>
        <Settings />
      </Grid>
    ),
    [gameSettings]
  );

  return (
    <>
      <Grid item xs={10}>
        <Grid container spacing={3}>
          <StandardGame
            settings={gameSettings}
            testDisabled={isPractice && practiceStrings.length === 0}
          />
        </Grid>
      </Grid>
      {SettingsDisplay}
      {isPractice ? <PracticeBox /> : null}
    </>
  );
}
