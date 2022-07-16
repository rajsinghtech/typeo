import React from "react";
import { GridCard } from "components/common";
import WordBox from "components/standard-game/word-box";
import StartMenu from "components/defender/start-menu";
import GameOver from "components/defender/game-over";
import PlayerRocket from "components/defender/player-rocket";
import Enemy, { EnemyType } from "components/defender/enemy";
import Bullet from "components/defender/bullet";
import Explosion from "components/defender/explosion";
import { useDefenderLogic } from "./hooks/DefenderLogic";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box, Grid, keyframes, Typography, useTheme } from "@mui/material";

export const PATH_WIDTH = "36px";
export const BORDER_WIDTH = "2px";

export const PATH_OFFSET_TOP_PERCENTAGE = 15;

export type DefenderStatus = "menu" | "running" | "finished";

export default function Defender() {
  const [status, setStatus] = React.useState<DefenderStatus>("menu");
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

interface DefenderComponentProps {
  setStatus: React.Dispatch<React.SetStateAction<DefenderStatus>>;
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
      {React.useMemo(() => {
        return (
          <Box ref={enemyBoxRef} width="100%">
            {defenderState.enemies.map(
              ({ type, charactersTyped, text, uid, delay }) => {
                return (
                  <Enemy
                    key={`enemy_${uid}`}
                    uid={uid}
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
