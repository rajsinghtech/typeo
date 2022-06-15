import React from "react";
import { useGameSettings } from "../../../../contexts/GameSettings";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import { GridCard } from "../../../common";
import {
  GameTypes,
  GameTypeNames,
  GameTypeAmounts,
  TextTypeNames,
  DefaultGameSettings,
} from "../../../../constants/settings";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AbcIcon from "@mui/icons-material/Abc";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import Filter1Icon from "@mui/icons-material/Filter1";

const GameTypeIcons = [
  <Typography key="timeSetting" fontSize="small">
    Time
  </Typography>,
  <Typography key="wordsSetting" fontSize="small">
    Word
  </Typography>,
  <Typography key="errorsSetting" fontSize="small">
    Error
  </Typography>,
];

const TextTypeIcons = [
  <Typography key="passageTextType" fontSize="small">
    Passage
  </Typography>,
  <Typography key="topWordsTextType" fontSize="small">
    Top Words
  </Typography>,
  <Typography key="numberTextType" fontSize="small">
    Numbers
  </Typography>,
];

export default function Settings() {
  const { gameSettings, setGameSettings } = useGameSettings();

  const SetMode = (inMode: number) => {
    setGameSettings({
      ...gameSettings,
      gameInfo: {
        ...gameSettings.gameInfo,
        type: inMode,
        amount: GameTypeAmounts[inMode][0],
      },
    });
  };

  const SetAmount = (inAmount: number) => {
    setGameSettings({
      ...gameSettings,
      gameInfo: { ...gameSettings.gameInfo, amount: inAmount },
    });
  };

  const SetTextType = (inTextType: number) => {
    setGameSettings({ ...gameSettings, textType: inTextType });
  };

  const TogglePracticeMode = () => {
    const { practice, ...gameInfo } = gameSettings.gameInfo;
    setGameSettings({
      ...gameSettings,
      gameInfo: {
        ...gameInfo,
        practice: { ...practice, isPractice: !practice.isPractice },
      },
    });
  };

  const ResetSettings = () => {
    setGameSettings(DefaultGameSettings);
  };

  return (
    <>
      <Box>
        <GridCard sx={{ marginBottom: 3, textAlign: "center" }}>
          <Typography marginBottom={1}>MODE</Typography>
          {GameTypeNames.map((name, index) => (
            <Tooltip
              disableHoverListener={index !== 0}
              title={name}
              placement="top"
              key={name}
            >
              <Button
                sx={{ margin: 1 }}
                onClick={() => SetMode(index)}
                color={
                  gameSettings.gameInfo.type === index ? "primary" : "inherit"
                }
              >
                {GameTypeIcons[index]}
              </Button>
            </Tooltip>
          ))}
          <Button
            variant="contained"
            sx={{ margin: 1 }}
            onClick={() => TogglePracticeMode()}
          >
            {gameSettings.gameInfo.practice.isPractice
              ? "Exit Practice"
              : "Practice Mode"}
          </Button>
        </GridCard>
        {GameTypeAmounts[gameSettings.gameInfo.type].length > 0 ? (
          <GridCard sx={{ marginBottom: 3, textAlign: "center" }}>
            <Typography marginBottom={1}>AMOUNT</Typography>
            {GameTypeAmounts[gameSettings.gameInfo.type].map(
              (amount, index) => (
                <Button
                  key={`${amount}_${index}`}
                  onClick={() => SetAmount(amount)}
                  color={
                    gameSettings.gameInfo.amount === amount
                      ? "primary"
                      : "inherit"
                  }
                >
                  <Typography fontSize="small">{amount}</Typography>
                </Button>
              )
            )}
          </GridCard>
        ) : null}
        {!gameSettings.gameInfo.practice.isPractice ? (
          <GridCard sx={{ textAlign: "center" }}>
            <Typography marginBottom={1}>TEXT TYPE</Typography>
            {TextTypeNames.map((name, index) => (
              <Button
                key={name}
                onClick={() => SetTextType(index)}
                color={gameSettings.textType === index ? "primary" : "inherit"}
              >
                {TextTypeIcons[index]}
              </Button>
            ))}
          </GridCard>
        ) : null}
      </Box>
    </>
  );
}
