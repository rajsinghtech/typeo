import React from "react";
import { RaceStateSubset } from "components/standard-game/hooks/RaceLogic";
import { DefenderStateReducerActions } from "components/defender/hooks/DefenderLogic";
import { useGameSettings } from "contexts/GameSettings";
import { PATH_OFFSET_TOP_PERCENTAGE } from "components/defender";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { Box, keyframes, LinearProgress, useTheme } from "@mui/material";

export interface EnemyType {
  type: EnemyVariant;
  raceState: RaceStateSubset;
  charactersTyped: number;
  text: string;
  uid: string;
  delay: number;
  isReachable: boolean;
}

export interface EnemyVariant {
  shape: "square" | "circle";
  color: string;
  numWords: number;
}

export const ENEMY_VARIANTS: EnemyVariant[] = [
  { shape: "square", color: "lawngreen", numWords: 2 },
  { shape: "square", color: "cyan", numWords: 4 },
  { shape: "square", color: "purple", numWords: 6 },
  { shape: "circle", color: "lawngreen", numWords: 10 },
  { shape: "circle", color: "cyan", numWords: 12 },
  { shape: "circle", color: "purple", numWords: 14 },
  { shape: "square", color: "red", numWords: 25 },
];

interface EnemyProps {
  uid: string;
  type: EnemyVariant;
  text: string;
  charactersTyped: number;
  targeted: boolean;
  delay: number;
  dispatch: React.Dispatch<DefenderStateReducerActions>;
}

export default React.memo(function Enemy({
  uid,
  type,
  text,
  charactersTyped,
  targeted,
  delay,
  dispatch,
}: EnemyProps) {
  const [paused, setPaused] = React.useState<boolean>(false);
  const [pausedTimer, setPausedTimer] = React.useState<number>(0);
  const { gameSettings } = useGameSettings();
  const theme = useTheme();

  let animationSpeed = 25;
  switch (gameSettings.defender.difficulty) {
    case "easy":
      animationSpeed = 25;
      break;
    case "medium":
      animationSpeed = 21;
      break;
    case "hard":
      animationSpeed = 14;
      break;
    case "impossible":
      animationSpeed = 8;
      break;
    default:
      break;
  }

  React.useEffect(() => {
    let isMounted = true;
    if (charactersTyped > 0 && targeted) {
      setPaused(true);
      clearTimeout(pausedTimer);
      const timer = window.setTimeout(() => {
        if (isMounted) {
          setPaused(false);
        }
      }, 500);
      setPausedTimer(timer);
    }

    return () => {
      isMounted = false;
    };
  }, [charactersTyped]);

  return (
    <Box
      sx={{
        position: "absolute",
        width: "100%",
        animation: `${moveEnemy} ${animationSpeed}s linear`,
        animationDelay: `${delay}s`,
        animationPlayState: paused ? "paused" : "running",
        left: 0,
        top: `${PATH_OFFSET_TOP_PERCENTAGE}%`,
        transform: "translateX(-5%)",
      }}
      onAnimationEnd={() =>
        dispatch({
          type: "takeDamage",
          enemyUID: uid,
          damage: Math.ceil((text.length - charactersTyped) / 5),
        })
      }
    >
      <Box
        sx={{
          position: "relative",
          boxShadow: `0 0 4px 1px ${type.color}`,
          width: "16px",
          height: "16px",
          borderRadius: type.shape === "circle" ? "50%" : 0,
          transform: "translateY(10px)",
          outline: targeted
            ? `2px dotted ${theme.palette.warning.main}`
            : "none",
          border: `1px solid ${type.color}`,
          zIndex: 1,
        }}
      >
        {charactersTyped > 0 ? (
          <LinearProgress
            variant="determinate"
            value={(1 - charactersTyped / text.length) * 100}
            sx={{
              position: "absolute",
              width: "100%",
              top: -20,
              ".MuiLinearProgress-bar": { transitionDuration: "75ms" },
            }}
          />
        ) : null}
        {targeted ? (
          <ArrowDropUpIcon
            color="warning"
            fontSize="medium"
            sx={{
              position: "absolute",
              top: 25,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        ) : null}
      </Box>
    </Box>
  );
});

const moveEnemy = keyframes`
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(100%);
    }`;
