import React from "react";
import StandardGame from "components/standard-game";
import { useGameSettings } from "contexts/GameSettings";
import PracticeBox from "components/standard-game/practice-box";
import Header from "pages/home/components/header";
import Settings from "components/standard-game/settings";
import Defender from "components/defender";
import { GameTypes } from "constants/settings";
import { Grid, useMediaQuery, useTheme } from "@mui/material";

export default function SoloGame() {
  const { gameSettings } = useGameSettings();

  const { isPractice, practiceStrings } = gameSettings.gameInfo.practice;

  const theme = useTheme();
  const mdScreenSize = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={10} alignSelf="flex-end">
        <Grid container spacing={3}>
          <Grid item display={{ xs: "none", md: "block" }} md={1.25} xl={1} />
          {mdScreenSize ? (
            <Grid item xs={12} md={10.75} xl={11} alignSelf="flex-start">
              <Header />
            </Grid>
          ) : null}
          {gameSettings.gameInfo.type === GameTypes.DEFENDER ? (
            <Defender />
          ) : (
            <StandardGame
              settings={gameSettings}
              testDisabled={isPractice && practiceStrings.length === 0}
            />
          )}
        </Grid>
      </Grid>
      <Grid item xs={12} lg={2} alignSelf="flex-end">
        <Settings />
      </Grid>
      {isPractice ? <PracticeBox /> : null}
    </Grid>
  );
}
