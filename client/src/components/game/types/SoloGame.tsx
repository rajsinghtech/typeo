import React from "react";
import StandardGame from "../components/Standard";
import { useGameSettings } from "../../../contexts/GameSettings";
import { Grid } from "@mui/material";
import MissedSequences from "../../stats/components/MissedSequences";
import StatKeyboard from "../../stats/components/StatKeyboard";
import PracticeBox from "../components/standardComponents/PracticeBox";

export default function SoloGame() {
  const {
    gameSettings,
    gameSettings: {
      gameInfo: {
        practice: { isPractice, practiceStrings },
      },
    },
  } = useGameSettings();

  return (
    <>
      <StandardGame
        settings={gameSettings}
        testDisabled={isPractice && practiceStrings.length === 0}
      />
      {gameSettings.gameInfo.practice.isPractice ? <PracticeBox /> : null}
    </>
  );
}
