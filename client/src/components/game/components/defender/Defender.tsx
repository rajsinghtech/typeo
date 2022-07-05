import {
  Box,
  Button,
  Grid,
  keyframes,
  LinearProgress,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { GridCard } from "../../../common";
import RocketIcon from "@mui/icons-material/Rocket";
import { v4 as uuidv4 } from "uuid";
import WordBox from "../standardComponents/WordBox";
import Follower from "../../feedback/Follower";
import FavoriteIcon from "@mui/icons-material/Favorite";
import {
  DefenderStateReducerActions,
  EnemyType,
  EnemyVariant,
  ParticleType,
  useDefenderLogic,
} from "./DefenderLogic";

const PATH_WIDTH = "36px";
const BORDER_WIDTH = "2px";

const PATH_OFFSET_TOP_PERCENTAGE = 15;

export default function Defender() {
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
        <DefenderComponent />
      </GridCard>
    </Grid>
  );
}

const DefenderComponent = () => {
  const { defenderState, defenderStateDispatch } = useDefenderLogic();

  const [isFocused, setIsFocused] = React.useState<boolean>(true);
  const [focusMessageOpen, setFocusMessageOpen] = React.useState<boolean>(true);
  const [focusTimeout, setFocusTimeout] = React.useState<number>(0);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const enemyBoxRef = React.useRef<HTMLDivElement>(null);
  const wbRef = React.useRef<HTMLDivElement>(null);
  const wbContainerRef = React.useRef<HTMLDivElement>(null);

  const theme = useTheme();

  const resetStyles = () => {
    if (wbRef.current) {
      for (const child of wbRef.current.children) {
        for (const c of child.children) {
          const element = c as HTMLElement;
          if (element) {
            element.style.color = theme.palette.text.disabled;
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
    } else if (
      wbRef.current &&
      wbRef.current.children[defenderState.raceState.wordsTyped]
    ) {
      const charDiv = wbRef.current.children[defenderState.raceState.wordsTyped]
        .children[
        defenderState.raceState.currentCharIndex -
          defenderState.raceState.currentWordIndex -
          1
      ] as HTMLElement;
      if (charDiv) {
        charDiv.style.color = theme.palette.text.primary;
      }
    }
  }, [defenderState.raceState.currentCharIndex]);

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
            <Button
              onClick={() => defenderStateDispatch({ type: "spawnEnemies" })}
              sx={{ position: "absolute", zIndex: 9999 }}
            >
              Start
            </Button>
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
                zIndex: 99,
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
        return (
          <Box sx={{ position: "absolute", width: "100%", top: "20%" }}>
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
            zIndex: 999,
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
                    delay={delay}
                    dispatch={defenderStateDispatch}
                  />
                );
              }
            )}
          </Box>
        );
      }, [defenderState.enemies])}
      {React.useMemo(() => {
        return (
          <>
            {defenderState.bullets.map((val, index) => {
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
            {defenderState.explosions.map((val, index) => {
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
                top: 15,
                left: "50%",
                transform: "translateX(-50%)",
                animation: `${keyframes`
                  0% {
                      opacity: 0
                  }
                  100% {
                      opacity: 1
                  }
                  `} 4s`,
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
const EXPLOSION_TIME = 1200;

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
  delay: number;
  dispatch: React.Dispatch<DefenderStateReducerActions>;
}

const Enemy = React.memo(function EnemyComponent({
  type,
  text,
  charactersTyped,
  delay,
  dispatch,
}: EnemyProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        width: "100%",
        animation: `${moveEnemy} 25s linear`,
        animationDelay: `${delay}s`,
        left: "-5%",
        top: `${PATH_OFFSET_TOP_PERCENTAGE}%`,
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
          zIndex: 99,
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
