import React from "react";
import StandardGame from "components/standard-game";
import { useGameSettings } from "contexts/GameSettings";
import PracticeBox from "components/standard-game/practice-box";
import MainHeader from "components/header/main";
import Settings from "components/standard-game/settings";
import Defender from "components/defender";
import { GameTypes } from "constants/settings";
import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";

export default function SoloGame() {
  const { gameSettings } = useGameSettings();

  const { isPractice, practiceStrings } = gameSettings.gameInfo.practice;

  const theme = useTheme();
  const smScreenSize = useMediaQuery(theme.breakpoints.down("sm"));
  const mdScreenSize = useMediaQuery(theme.breakpoints.up("md"));

  const DefenderMode = gameSettings.gameInfo.type === GameTypes.DEFENDER;

  return (
    <Grid container spacing={3}>
      {mdScreenSize && (
        <Grid item xs={12} mb={5}>
          <MainHeader />
        </Grid>
      )}
      {!smScreenSize && (
        <Grid item xs={12}>
          <Settings />
        </Grid>
      )}
      <Grid item xs={12} lg={12}>
        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={3}>
          {DefenderMode ? (
            <Defender />
          ) : (
            <StandardGame
              settings={gameSettings}
              testDisabled={isPractice && practiceStrings.length === 0}
            />
          )}
        </Box>
      </Grid>
      {smScreenSize && (
        <Grid item xs={12}>
          <Settings />
        </Grid>
      )}
      {isPractice ? <PracticeBox /> : null}
    </Grid>
  );
}
