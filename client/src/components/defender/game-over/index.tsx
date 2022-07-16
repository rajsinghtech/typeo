import React from "react";
import { DefenderStatus } from "components/defender";
import { Box, Typography, Button } from "@mui/material";
import { useGameSettings } from "contexts/GameSettings";

interface GameOverProps {
  score: number;
  setStatus: React.Dispatch<React.SetStateAction<DefenderStatus>>;
}

export default function GameOver({ score, setStatus }: GameOverProps) {
  const [highscore, setHighscore] = React.useState<number>(0);

  const { gameSettings } = useGameSettings();
  const difficulty = gameSettings.defender.difficulty;

  React.useEffect(() => {
    let newHighscore = score;
    const storedHighscore = localStorage.getItem("defender_highscore");
    if (storedHighscore) {
      let parsedHighscore = JSON.parse(storedHighscore);

      if (typeof parsedHighscore === "number") {
        parsedHighscore = { easy: 0, medium: 0, hard: 0, impossible: 0 };
      }

      if (score > parsedHighscore[difficulty]) {
        parsedHighscore[difficulty] = score;
        localStorage.setItem(
          "defender_highscore",
          JSON.stringify(parsedHighscore)
        );
      }
      newHighscore = parsedHighscore[difficulty];
    } else {
      const highscore = { easy: 0, medium: 0, hard: 0, impossible: 0 };
      highscore[difficulty] = score;
      localStorage.setItem("defender_highscore", JSON.stringify(highscore));
    }
    setHighscore(newHighscore);
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      width="100%"
      height="100%"
      alignItems="center"
      gap={1}
    >
      <Typography variant="h2" color="text.primary">
        Game Over
      </Typography>
      <Typography variant="h5">{difficulty}</Typography>
      <Typography variant="h6">Score</Typography>
      <Typography variant="h3" color="warning.main">
        {score.toFixed(0)}
      </Typography>
      <Typography variant="h6">Highscore</Typography>
      <Typography variant="h3">{highscore.toFixed(0)}</Typography>
      <Button
        variant="outlined"
        color="secondary"
        sx={{ mt: 2 }}
        onClick={() => setStatus("menu")}
      >
        Play Again
      </Button>
    </Box>
  );
}
