import React from "react";
import { GridCard } from "components/common";
import WordBox from "components/standard-game/word-box";
import { useGameSettings } from "contexts/GameSettings";
import { Difficulty } from "constants/settings";
import {
  DefenderStateReducerActions,
  EnemyType,
  EnemyVariant,
  EXPLOSION_TIME,
  ParticleType,
  useDefenderLogic,
} from "./hooks/DefenderLogic";
import RocketIcon from "@mui/icons-material/Rocket";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import {
  Box,
  Button,
  Grid,
  keyframes,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";

const PATH_WIDTH = "36px";
const BORDER_WIDTH = "2px";

const PATH_OFFSET_TOP_PERCENTAGE = 15;

type Status = "menu" | "running" | "finished";

export default function Defender() {
  const [status, setStatus] = React.useState<Status>("menu");
  const [resultScore, setResultScore] = React.useState<number>(0);

  return (
    <Grid item xs={12}>
      {/* <Button onClick={() => setLevel((prev) => prev + 1)}>Start</Button> */}
      <GridCard
        padding={"0px"}
        sx={{
          position: "relative",
          backgroundImage: "url(tdbackground.png)",
          backgroundSize: "contain",
          height: "600px",
          margin: "0 auto",
        }}
      >
        {status === "menu" ? (
          <StartMenu setStatus={setStatus} />
        ) : status === "running" ? (
          <DefenderComponent
            setStatus={setStatus}
            setResultScore={setResultScore}
          />
        ) : (
          <GameOver score={resultScore} setStatus={setStatus} />
        )}
      </GridCard>
    </Grid>
  );
}

const StartMenu = ({
  setStatus,
}: {
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
}) => {
  const { gameSettings, setGameSettings } = useGameSettings();

  const theme = useTheme();
  const vsScreenSize = useMediaQuery(theme.breakpoints.up("vs"));

  const SetDifficulty = (_: unknown, newDifficulty: Difficulty) => {
    setGameSettings({
      ...gameSettings,
      defender: { ...gameSettings.defender, difficulty: newDifficulty },
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      width="100%"
      height="100%"
      alignItems="center"
      textAlign="center"
      gap={5}
      px={1}
    >
      <Typography variant="h1" color="text.primary">
        Defender
      </Typography>
      <Typography variant="subtitle1">
        Tip: There is a bonus round every 7 levels
      </Typography>
      <ToggleButtonGroup
        value={gameSettings.defender.difficulty}
        orientation={vsScreenSize ? "horizontal" : "vertical"}
        exclusive
        onChange={SetDifficulty}
      >
        <ToggleButton value="easy" color="success">
          Easy
        </ToggleButton>
        <ToggleButton value="medium" color="primary">
          Medium
        </ToggleButton>
        <ToggleButton value="hard" color="warning">
          Hard
        </ToggleButton>
        <ToggleButton value="impossible" color="error">
          Impossible
        </ToggleButton>
      </ToggleButtonGroup>
      <Button
        variant="outlined"
        color="secondary"
        sx={{ mt: 2 }}
        onClick={() => setStatus("running")}
      >
        Start
      </Button>
    </Box>
  );
};

interface GameOverProps {
  score: number;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
}

const GameOver = ({ score, setStatus }: GameOverProps) => {
  const [highscore, setHighscore] = React.useState<number>(0);

  React.useEffect(() => {
    let newHighscore = score;
    const storedHighscore = localStorage.getItem("defender_highscore");
    if (storedHighscore) {
      const parsedHighscore = parseInt(storedHighscore);
      if (score > parsedHighscore) {
        localStorage.setItem("defender_highscore", `${score}`);
        newHighscore = score;
      } else {
        newHighscore = parsedHighscore;
      }
    } else {
      localStorage.setItem("defender_highscore", `${score}`);
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
};

interface DefenderComponentProps {
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  setResultScore: React.Dispatch<React.SetStateAction<number>>;
}

const DefenderComponent = ({
  setStatus,
  setResultScore,
}: DefenderComponentProps) => {
  const { defenderState, defenderStateDispatch } = useDefenderLogic();

  const [isFocused, setIsFocused] = React.useState<boolean>(true);
  const [focusMessageOpen, setFocusMessageOpen] = React.useState<boolean>(true);
  const [focusTimeout, setFocusTimeout] = React.useState<number>(0);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const enemyBoxRef = React.useRef<HTMLDivElement>(null);
  const wbRef = React.useRef<HTMLDivElement>(null);

  const theme = useTheme();

  const resetStyles = () => {
    if (wbRef.current) {
      for (const child of wbRef.current.children) {
        for (const c of child.children) {
          const element = c as HTMLElement;
          if (element) {
            element.style.color = theme.palette.text.disabled;
            element.style.border = "none";
          }
        }
      }
    }
  };

  const getCurrentEnemy = (): EnemyType | undefined => {
    const currentEnemyIndex = defenderState.enemies.findIndex(
      (enemy) => enemy.uid === defenderState.currentEnemyUID
    );
    return defenderState.enemies[currentEnemyIndex];
  };

  React.useEffect(() => {
    if (defenderState.raceState.currentCharIndex === 0) {
      resetStyles();
    } else if (wbRef.current) {
      const raceState = defenderState.raceState;

      const isNewWord =
        raceState.currentCharIndex === raceState.currentWordIndex;
      const wordIndex = isNewWord
        ? Math.max(raceState.wordsTyped - 1, 0)
        : raceState.wordsTyped;

      if (!wbRef.current.children[wordIndex]) return;

      const charDiv = isNewWord
        ? (wbRef.current.children[wordIndex].lastChild as HTMLElement)
        : (wbRef.current.children[wordIndex].children[
            defenderState.raceState.currentCharIndex -
              defenderState.raceState.currentWordIndex -
              1
          ] as HTMLElement);
      if (charDiv) {
        charDiv.style.color = theme.palette.text.primary;
        if (charDiv.innerHTML === "&nbsp;") {
          charDiv.style.borderBottom = `2px solid ${theme.palette.text.primary}`;
        }
      }
    }
  }, [defenderState.raceState.currentCharIndex]);

  React.useEffect(() => {
    if (wbRef.current) {
      let count = 0;
      for (const word of wbRef.current.children) {
        for (const letter of word.children) {
          if (count >= defenderState.raceState.currentCharIndex) return;
          count++;
          const charDiv = letter as HTMLElement;
          if (charDiv) {
            charDiv.style.color = theme.palette.text.primary;
            if (charDiv.innerHTML === "&nbsp;") {
              charDiv.style.borderBottom = `2px solid ${theme.palette.text.primary}`;
            }
          }
        }
      }
    }
  }, [defenderState.currentEnemyUID]);

  React.useEffect(() => {
    if (defenderState.isFinished) {
      setResultScore(defenderState.score);
      setStatus("finished");
    }
  }, [defenderState.isFinished]);

  React.useEffect(() => {
    clearTimeout(focusTimeout);
    if (isFocused) {
      if (wbRef.current) {
        wbRef.current.style.filter = "none";
      }
      setFocusMessageOpen(false);
    } else {
      const timeout = window.setTimeout(() => {
        setFocusMessageOpen(true);
        if (wbRef.current) {
          wbRef.current.style.filter = "blur(2px)";
        }
      }, 1000);
      setFocusTimeout(timeout);
    }

    return () => {
      clearTimeout();
    };
  }, [isFocused]);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    const onBodyKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") return;
      if (inputRef.current) {
        if (document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }
    };
    document.body.addEventListener("keyup", onBodyKeyDown);

    return () => {
      document.body.removeEventListener("keyup", onBodyKeyDown);
    };
  }, []);

  return (
    <>
      {React.useMemo(() => {
        return (
          <>
            <input
              id="type"
              name="type"
              autoComplete="off"
              style={{
                position: "absolute",
                opacity: 0,
                width: "100%",
                height: "100%",
                top: 0,
                left: 0,
                cursor: "default",
                zIndex: 1,
              }}
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) =>
                defenderStateDispatch({
                  type: "keydown",
                  event,
                  enemyBoxRef,
                })
              }
              onFocus={() => {
                setIsFocused(true);
              }}
              onBlur={() => {
                setIsFocused(false);
              }}
              ref={inputRef}
            />
            <PathSection
              length="100%"
              top={`${PATH_OFFSET_TOP_PERCENTAGE}%`}
              left={0}
            />
          </>
        );
      }, [isFocused])}
      {React.useMemo(() => {
        if (defenderState.errors === 0) {
          return null;
        } else {
          return (
            <Box
              key={`errors_${defenderState.errors}`}
              position="absolute"
              width="100%"
              top="23%"
              textAlign="center"
              sx={{
                opacity: 0,
                animation: `${keyframes`
          0% {
            opacity: 1
          }
          100% {
            opacity: 0
          }`} 1s`,
              }}
            >
              <ErrorOutlineIcon color="error" />
            </Box>
          );
        }
      }, [defenderState.errors])}
      {React.useMemo(() => {
        return (
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              top: "20%",
            }}
          >
            <WordBox
              words={getCurrentEnemy()?.text.split(" ") || []}
              boxRef={wbRef}
              textAlign="center"
            />
          </Box>
        );
      }, [defenderState.currentEnemyUID])}
      {/* {React.useMemo(() => {
        return (
          <Box
            key={`errors_${defenderState.errors}`}
            position="absolute"
            width="100%"
            height="100%"
            sx={{
              animation: `${keyframes`
              0% {
                background-color: rgba(255, 0, 0, 0.1)
              }
              100% {
                background-color: transparent
              }`} 2s`,
            }}
          ></Box>
        );
      }, [defenderState.errors])} */}
      {focusMessageOpen ? (
        <GridCard
          sx={{
            position: "absolute",
            width: "100%",
            left: 0,
            top: "50%",
            textAlign: "center",
            zIndex: 2,
            backgroundColor: "primary.main",
          }}
        >
          <Typography color="secondary" variant="h6">
            Click here or press any key to focus
          </Typography>
        </GridCard>
      ) : null}
      {/* {defenderState.enemies.length > 0 ? (
        <Follower raceState={defenderState.raceState} wbRef={wbRef} />
      ) : null} */}
      {React.useMemo(() => {
        return (
          <Box ref={enemyBoxRef} width="100%">
            {defenderState.enemies.map(
              ({ type, charactersTyped, text, uid, delay }) => {
                return (
                  <Enemy
                    key={`enemy_${uid}`}
                    type={type}
                    text={text}
                    charactersTyped={charactersTyped}
                    targeted={defenderState.currentEnemyUID === uid}
                    delay={delay}
                    dispatch={defenderStateDispatch}
                  />
                );
              }
            )}
          </Box>
        );
      }, [defenderState.enemies, defenderState.currentEnemyUID])}
      {React.useMemo(() => {
        return (
          <>
            {defenderState.bullets.map((val) => {
              return (
                <Bullet
                  key={`bullet_${val.uid}`}
                  offsetLeft={val.offsetLeft}
                  uid={val.uid}
                  enemyBoxRef={enemyBoxRef}
                  dispatch={defenderStateDispatch}
                />
              );
            })}
          </>
        );
      }, [defenderState.bullets])}
      {React.useMemo(() => {
        return (
          <>
            {defenderState.explosions.map((val) => {
              return (
                <Explosion
                  key={`bullet_${val.uid}`}
                  offsetLeft={val.offsetLeft}
                  particleData={val.particleData}
                />
              );
            })}
          </>
        );
      }, [defenderState.explosions])}

      {React.useMemo(() => {
        return <PlayerRocket shipRotation={defenderState.shipRotation} />;
      }, [defenderState.shipRotation])}

      {React.useMemo(() => {
        return (
          <Box sx={{ position: "absolute", left: 40, bottom: 25 }}>
            <Box>
              <Typography display="inline" variant="h5" color="primary.main">
                {"Score: "}
              </Typography>
              <Typography display="inline" variant="h5" color="text.primary">
                {defenderState.score.toFixed(0)}
              </Typography>
            </Box>
            <Box>
              <Typography display="inline" variant="h6" color="warning.main">
                {"Multiplier: "}
              </Typography>
              <Typography display="inline" variant="h6" color="text.primary">
                {` x${defenderState.multiplier.toFixed(1)}`}
              </Typography>
            </Box>
          </Box>
        );
      }, [defenderState.score, defenderState.multiplier])}
      {React.useMemo(() => {
        return (
          <>
            <Typography
              key={defenderState.level}
              variant="h6"
              sx={{
                position: "absolute",
                top: "4%",
                left: "50%",
                transform: "translateX(-50%)",
                opacity: 0,
                animation: `${keyframes`
                  0% {
                      opacity: 0
                  }
                  50% {
                    opacity: 1
                  }
                  100% {
                      opacity: 0
                  }
                  `} 5s ease-out`,
              }}
            >{`Level ${defenderState.level}`}</Typography>
            <Box sx={{ position: "absolute", right: 40, bottom: 25 }}>
              <FavoriteIcon
                color="error"
                sx={{ marginRight: 2, marginBottom: -0.5 }}
              />
              <Typography display="inline" variant="h5" color="text.primary">
                {defenderState.health}
              </Typography>
            </Box>
          </>
        );
      }, [defenderState.level, defenderState.health])}
    </>
  );
};

interface PlayerRocketProps {
  shipRotation: number;
}

const PlayerRocket = ({ shipRotation }: PlayerRocketProps) => {
  return (
    <Box
      position="absolute"
      textAlign="center"
      width="100%"
      top="80%"
      sx={{ transform: `rotate(${shipRotation}deg)` }}
    >
      <RocketIcon fontSize="large" color="primary" />
    </Box>
  );
};

const BULLET_TIME = 350;

interface BulletProps {
  offsetLeft: number;
  uid: string;
  enemyBoxRef: React.RefObject<HTMLDivElement>;
  dispatch: React.Dispatch<DefenderStateReducerActions>;
}

const Bullet = React.memo(function BulletComponent({
  offsetLeft,
  uid,
  enemyBoxRef,
  dispatch,
}: BulletProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        width: "100%",
        height: "100%",
        transform: "translate(50%, 82%)",
        animation: `${keyframes`
    0% {
      transform: translate(50%, 82%)
    }
    100% {
      transform: translate(calc(4% + ${offsetLeft}px), ${
          PATH_OFFSET_TOP_PERCENTAGE + 3
        }%)
    }
    `} ${BULLET_TIME}ms linear`,
      }}
      onAnimationEnd={() =>
        dispatch({ type: "bulletHit", bulletUID: uid, enemyBoxRef })
      }
    >
      <Box
        sx={{ boxShadow: `0 0 4px 2px rgba(227, 252, 3, 1)` }}
        bgcolor="white"
        width="4px"
        height="4px"
        borderRadius="50%"
      ></Box>
    </Box>
  );
});

const Explosion = React.memo(function ExplosionComponent({
  offsetLeft,
  particleData,
}: {
  offsetLeft: number;
  particleData: ParticleType[];
}) {
  return (
    <>
      {particleData.map(({ x, y, color }, index) => {
        return (
          <Box
            key={`p${index}_${x}_${y}`}
            sx={{
              opacity: 0,
              animation: `${keyframes`
          0% {
            opacity: 1;
            top: ${PATH_OFFSET_TOP_PERCENTAGE + 3}%;
            left: ${offsetLeft}px;
          }
          100% {
            opacity: 0;
            top: calc(${PATH_OFFSET_TOP_PERCENTAGE + 3}% + ${y}px);
            left: ${offsetLeft + x}px;
          }`} ${EXPLOSION_TIME}ms cubic-bezier(0, 0.87, 0.49, 0.9)`,
              boxShadow: `0 0 5px 2px ${color}`,
            }}
            position="absolute"
            bgcolor="rgba(255, 255, 255, 0.8)"
            top={`calc(50% + ${y}px)`}
            left={`calc(50% + ${x}px)`}
            width="7px"
            height="7px"
            borderRadius="50%"
          ></Box>
        );
      })}
    </>
  );
});

interface EnemyProps {
  type: EnemyVariant;
  text: string;
  charactersTyped: number;
  targeted: boolean;
  delay: number;
  dispatch: React.Dispatch<DefenderStateReducerActions>;
}

const Enemy = React.memo(function EnemyComponent({
  type,
  text,
  charactersTyped,
  targeted,
  delay,
  dispatch,
}: EnemyProps) {
  const { gameSettings } = useGameSettings();
  let animationSpeed = 25;
  switch (gameSettings.defender.difficulty) {
    case "easy":
      animationSpeed = 28;
      break;
    case "medium":
      animationSpeed = 23;
      break;
    case "hard":
      animationSpeed = 15;
      break;
    case "impossible":
      animationSpeed = 10;
      break;
    default:
      break;
  }
  return (
    <Box
      sx={{
        position: "absolute",
        width: "100%",
        animation: `${moveEnemy} ${animationSpeed}s linear`,
        animationDelay: `${delay}s`,
        left: 0,
        top: `${PATH_OFFSET_TOP_PERCENTAGE}%`,
        transform: "translateX(105%)",
      }}
      onAnimationEnd={() =>
        dispatch({ type: "dealDamage", damage: text.split(" ").length })
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
          outline: `1px solid ${type.color}`,
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

interface PathSectionProps {
  vertical?: boolean;
  length: number | string;
  top: number | string;
  left: number | string;
}

const PathSection = ({ vertical, length, top, left }: PathSectionProps) => {
  return (
    <Box
      position="absolute"
      borderTop={vertical ? "none" : `${BORDER_WIDTH} solid gray`}
      borderBottom={vertical ? "none" : `${BORDER_WIDTH} solid gray`}
      borderLeft={vertical ? `${BORDER_WIDTH} solid gray` : "none"}
      borderRight={vertical ? `${BORDER_WIDTH} solid gray` : "none"}
      top={top}
      left={left}
      width={vertical ? PATH_WIDTH : length}
      height={vertical ? length : PATH_WIDTH}
    ></Box>
  );
};

// interface PathCornerProps {
//   orientation: 0 | 1 | 2 | 3; // 0 - top, right; 1 - right, bottom; 2 - bottom, left; 3 - left, top
//   top: string | number;
//   left: string | number;
// }

// const PathCorner = ({ orientation, top, left }: PathCornerProps) => {
//   return (
//     <Box
//       sx={{ transform: `rotate(${orientation * 90}deg)` }}
//       position="absolute"
//       top={top}
//       left={left}
//       width={PATH_WIDTH}
//       height={PATH_WIDTH}
//       borderTop={`${BORDER_WIDTH} solid gray`}
//       borderRight={`${BORDER_WIDTH} solid gray`}
//       zIndex={999}
//     ></Box>
//   );
// };
