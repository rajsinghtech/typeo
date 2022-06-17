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

const styles = {
  amountCard: {
    display: "inline-block",
    textAlign: "center",
    padding: "10px",
    paddingLeft: "13px",
    paddingTop: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
};

export default function SoloGame() {
  const { gameSettings } = useGameSettings();

  const { isPractice, practiceStrings } = gameSettings.gameInfo.practice;

  const raceLogic = useRaceLogic({
    settings: gameSettings,
    testDisabled: isPractice && practiceStrings.length === 0,
  });

  const HomeProfileDisplay = React.useMemo(
    () => (
      <Grid item xs={2} position="relative">
        <Box position="absolute" bottom={0}>
          <HomeProfile />
        </Box>
      </Grid>
    ),
    []
  );

  const AmountDisplay = React.useMemo(
    () => (
      <Grid item xs={6} textAlign="center">
        <Card sx={styles.amountCard} elevation={15}>
          <Typography variant="h4">{raceLogic.amount}</Typography>
        </Card>
      </Grid>
    ),
    [raceLogic.amount]
  );

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
        <Settings />
      </Grid>
    ),
    [gameSettings]
  );

  return (
    <Grid container spacing={3}>
      <Results
        open={raceLogic.raceStatus.isRaceFinished}
        setOpen={raceLogic.ResetRace}
        data={raceLogic.statState.resultsData}
      />
      {HomeProfileDisplay}
      {AmountDisplay}
      {TopSettingsDisplay}
      <Grid item xs={10}>
        <StandardGame
          settings={gameSettings}
          raceLogic={raceLogic}
          testDisabled={isPractice && practiceStrings.length === 0}
        />
      </Grid>
      {SettingsDisplay}
      {isPractice ? <PracticeBox /> : null}
    </Grid>
  );
}
