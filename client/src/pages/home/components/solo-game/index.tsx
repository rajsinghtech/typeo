import React from "react";
import StandardGame from "components/standard-game";
import { useGameSettings } from "contexts/GameSettings";
import PracticeBox from "components/standard-game/practice-box";
import HomeProfile from "pages/home/components/profile-display";
import Settings from "components/standard-game/settings";
import Defender from "components/defender";
import { GameTypes } from "constants/settings";
import { Box, Grid } from "@mui/material";

export default function SoloGame() {
  const { gameSettings } = useGameSettings();

  const { isPractice, practiceStrings } = gameSettings.gameInfo.practice;

  return (
    <>
      <Grid item xs={1.5}>
        <Box mt={12}>
          {gameSettings.display.showProfile ? <HomeProfile /> : null}
        </Box>
      </Grid>
      <Grid item xs={7.5}>
        <Grid container spacing={3}>
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
      <Grid item xs={3}>
        <Box mt={0}>
          <Settings />
        </Box>
      </Grid>
      {isPractice ? <PracticeBox /> : null}
    </>
  );
}
