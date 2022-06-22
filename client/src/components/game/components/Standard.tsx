import React from "react";
import { useHistory } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import SpeedProgress, { calculateWPMColor } from "../feedback/SpeedProgress";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { GridCard, StyledTextField } from "../../common";
import { Box, IconButton, Theme, Typography } from "@mui/material";
import Follower from "../feedback/Follower";
import WordBox from "./standardComponents/WordBox";
import { GameSettings, GameTypes } from "../../../constants/settings";
import { useAuth } from "../../../contexts/AuthContext";
import Settings from "./standardComponents/Settings";
import Results from "./results/Results";
import { MAX_INPUT_LENGTH, ResultsData } from "../../../constants/race";
import { OnlineRaceData } from "../types/FFAGame";
import useRaceLogic, {
  RaceLogic,
  RaceState,
  RaceStateReducerActions,
} from "../RaceLogic";
import HomeProfile from "../../profile/display/HomeProfile";
import { useSnackbar } from "notistack";
import TopSettings from "./standardComponents/TopSettings";
import { useTheme } from "@mui/material";

const styles = {
  amountCard: {
    display: "inline-block",
    textAlign: "center",
    padding: "10px",
    paddingLeft: "13px",
    paddingTop: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
};

const usePrevious = (value: any): any => {
  const ref = React.useRef<any>();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const PREFIX = "MuiStandardGame";

interface StandardGameProps {
  settings: GameSettings;
  testDisabled?: boolean;
  onlineRaceData?: OnlineRaceData;
  setResultsDataProp?: (data: ResultsData) => void;
}

export default function StandardGame({
  settings,
  testDisabled,
  onlineRaceData,
  setResultsDataProp,
}: StandardGameProps) {
  const { currentUser } = useAuth();

  const { raceState, raceStateDispatch } = useRaceLogic({
    settings,
    testDisabled,
  });

  const prevRaceState = usePrevious(raceState);
  // Element Details
  const wbContainerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const wbRef = React.useRef<HTMLDivElement>(null);
  const [inputDisabled, setInputDisabled] = React.useState<boolean>(false);
  const [isFocused, setIsFocused] = React.useState<boolean>(true);
  const [focusMessageOpen, setFocusMessageOpen] = React.useState<boolean>(true);
  const [focusTimeout, setFocusTimeout] = React.useState<number>(0);

  const theme = useTheme();

  const StyleReset = React.useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }

    if (wbRef.current) {
      wbRef.current.style.top = "0";
      for (const child of wbRef.current.children) {
        for (const c of child.children) {
          const element = c as HTMLElement;
          if (element) {
            element.style.color = "inherit";
            element.style.backgroundColor = "inherit";
            element.style.outline = "none";
            element.style.borderBottom = "none";
            element.style.marginBottom = "0";
          }
        }
      }
    }
  }, []);

  const Reset = React.useCallback(
    (retry: boolean) => {
      raceStateDispatch({
        type: "reset",
        shouldStartRace: false,
        retry,
        settings,
      });

      StyleReset();
    },
    [settings]
  );

  React.useEffect(() => {
    StyleReset();
  }, [settings.gameInfo, settings.textType]);

  React.useEffect(() => {
    if (raceState.isRaceFinished) {
      StyleReset();
      if (settings.online) {
        setInputDisabled(true);
      }
    }
  }, [raceState.isRaceFinished]);

  React.useEffect(() => {
    updateStyles(prevRaceState, raceState, wbRef, theme, settings);
  }, [
    raceState.currentCharIndex,
    raceState.overflowCount,
    raceState.isCorrect,
    settings.gameInfo,
  ]);

  React.useEffect(() => {
    const onBodyKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") return;
      if (inputRef.current) {
        if (
          document.activeElement !== inputRef.current &&
          !raceState.isRaceFinished
        ) {
          inputRef.current.focus();
        }
      }
    };
    document.body.addEventListener("keyup", onBodyKeyDown);

    return () => {
      document.body.removeEventListener("keyup", onBodyKeyDown);
    };
  }, [raceState.isRaceFinished]);

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

  const ResultsDisplay = React.useMemo(() => {
    return (
      <Results
        open={raceState.isRaceFinished}
        onClose={Reset}
        data={raceState.statState.resultsData}
      />
    );
  }, [settings, raceState.isRaceFinished]);

  const AmountDisplay = React.useMemo(() => {
    return (
      <Grid item xs={8} textAlign="center">
        <Card sx={styles.amountCard} elevation={15}>
          <Typography variant="h4">{raceState.amount}</Typography>
        </Card>
      </Grid>
    );
  }, [raceState.amount]);

  const MainDisplay = React.useMemo(() => {
    return (
      <Grid
        item
        xs={12}
        sx={{ userSelect: "none" }}
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        <GridCard
          refObject={wbContainerRef}
          accent={true}
          sx={{ position: "relative", textAlign: "center" }}
        >
          <input
            id="type"
            name="type"
            autoComplete="off"
            maxLength={MAX_INPUT_LENGTH}
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
            onKeyDown={(event) =>
              raceStateDispatch({
                type: "keydown",
                event,
                settings,
                currentUser,
              })
            }
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              raceStateDispatch({
                type: "onChange",
                event,
                settings,
                currentUser,
              })
            }
            onFocus={(e: React.ChangeEvent<HTMLInputElement>) => {
              setIsFocused(true);
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              setIsFocused(false);
            }}
            disabled={inputDisabled || testDisabled}
            ref={inputRef}
          />
          {testDisabled && settings.gameInfo.practice.isPractice ? (
            <Typography textAlign="center" height={300} pt={15}>
              Select keys or sequences to add/remove them from your practice
            </Typography>
          ) : (
            <>
              {focusMessageOpen ? (
                <GridCard
                  sx={{
                    position: "absolute",
                    width: "100%",
                    left: 0,
                    textAlign: "center",
                    mt: 15,
                    zIndex: 999,
                    backgroundColor: "primary.main",
                  }}
                >
                  <Typography color="secondary" variant="h6">
                    Click here or press any key to focus
                  </Typography>
                </GridCard>
              ) : null}
              <WordBox words={raceState.words} boxRef={wbRef} />
            </>
          )}
          {/* {onlineRaceData
            ? onlineRaceData.playerData.map((player) => {
                if (player.id === currentUser.uid) return null;
                const { col, cot, cw } = calculateFollowerPosition(
                  player.wordsTyped,
                  raceState.words,
                  wbRef
                );
                return (
                  <Follower
                    key={player.id}
                    wbRef={wbRef}
                    raceState={prevRaceState}
                  />
                );
              })
            : null} */}
          {!settings.online ? (
            <IconButton
              color="secondary"
              onClick={() => Reset(false)}
              sx={{ zIndex: 999 }}
            >
              <RestartAltIcon />
            </IconButton>
          ) : null}
        </GridCard>
      </Grid>
    );
  }, [
    raceState.words,
    raceStateDispatch,
    inputDisabled,
    testDisabled,
    settings,
    currentUser,
    focusMessageOpen,
  ]);

  return (
    <>
      {ResultsDisplay}
      <Follower
        disabled={!raceState.isRaceRunning}
        wbContainerRef={wbContainerRef}
        wbRef={wbRef}
        raceState={raceState}
      />
      {settings.display.showWPM ? (
        <SpeedProgress wpm={raceState.statState.wpm} />
      ) : null}
      {AmountDisplay}
      {MainDisplay}
    </>
  );
}

const CharStyle = {
  NONE: 0,
  CORRECT: 1,
  INCORRECT: 2,
};

const setCharStyle = (
  charStyle: number,
  wordIndex: number,
  index: number,
  theme: Theme,
  wbRef: React.RefObject<HTMLDivElement>
) => {
  if (!(wbRef.current && wbRef.current.children[wordIndex])) return;
  const charDiv = wbRef.current.children[wordIndex].children[
    index
  ] as HTMLElement;
  if (!charDiv) return;
  switch (charStyle) {
    case CharStyle.NONE:
      charDiv.style.color = "inherit";
      if (charDiv.style.outline !== "none") {
        charDiv.style.backgroundColor = "inherit";
        charDiv.style.outline = "none";
      }
      break;
    case CharStyle.CORRECT:
      charDiv.style.color = theme.palette.secondary.main;
      if (charDiv.style.outline !== "none") {
        charDiv.style.backgroundColor = "inherit";
        charDiv.style.outline = "none";
      }
      break;
    case CharStyle.INCORRECT:
      if (charDiv.innerHTML === "&nbsp;") {
        charDiv.style.backgroundColor = "rgba(255,0,0,0.25)";
        charDiv.style.outline = `1px solid ${theme.palette.error.main}`;
      } else {
        charDiv.style.color = theme.palette.error.main;
        if (charDiv.style.outline !== "none") {
          charDiv.style.backgroundColor = "inherit";
          charDiv.style.outline = "none";
        }
      }
      break;
  }
};

const updateStyles = (
  prevRaceState: RaceState,
  raceState: RaceState,
  wbRef: React.RefObject<HTMLDivElement>,
  theme: Theme,
  settings: GameSettings
) => {
  const prevCurrentCharIndex = prevRaceState?.currentCharIndex || 0;
  const prevCurrentWordIndex = prevRaceState?.currentWordIndex || 0;
  const prevWordsTyped = prevRaceState?.wordsTyped || 0;
  const characterDifference = raceState.currentCharIndex - prevCurrentCharIndex;
  if (characterDifference === 1) {
    if (!raceState.isCorrect || raceState.prevKey !== " ") {
      setCharStyle(
        raceState.isCorrect ? CharStyle.CORRECT : CharStyle.INCORRECT,
        prevWordsTyped,
        prevCurrentCharIndex - prevCurrentWordIndex,
        theme,
        wbRef
      );
    }
  } else if (characterDifference === -1) {
    setCharStyle(
      CharStyle.NONE,
      raceState.wordsTyped,
      raceState.currentCharIndex - raceState.currentWordIndex,
      theme,
      wbRef
    );
  } else if (characterDifference < -1) {
    let currentWordsTyped = raceState.wordsTyped;
    let letterIndex = raceState.currentCharIndex - raceState.currentWordIndex;
    for (let i = raceState.currentCharIndex; i <= prevCurrentCharIndex; i++) {
      setCharStyle(
        CharStyle.NONE,
        currentWordsTyped,
        letterIndex,
        theme,
        wbRef
      );
      if (raceState.textAreaText[i] === " ") {
        currentWordsTyped++;
        letterIndex = 0;
      } else {
        letterIndex++;
      }
    }
    if (raceState.prevKey.length === 1) {
      if (!raceState.isCorrect) {
        setCharStyle(
          CharStyle.INCORRECT,
          raceState.wordsTyped,
          raceState.currentCharIndex - raceState.currentWordIndex - 1,
          theme,
          wbRef
        );
      } else {
        setCharStyle(
          CharStyle.CORRECT,
          raceState.wordsTyped,
          raceState.currentCharIndex - raceState.currentWordIndex - 1,
          theme,
          wbRef
        );
      }
    }
  }
  if (raceState.overflowCount > 0 && !raceState.isCorrect) {
    setCharStyle(
      CharStyle.INCORRECT,
      raceState.wordsTyped,
      raceState.currentCharIndex - raceState.currentWordIndex,
      theme,
      wbRef
    );
  }
  if (prevRaceState?.overflowCount > 0 && raceState.overflowCount === 0) {
    if (prevRaceState?.wordsTyped === raceState.wordsTyped) {
      setCharStyle(
        CharStyle.NONE,
        prevRaceState.wordsTyped,
        prevRaceState.currentCharIndex - prevRaceState.currentWordIndex,
        theme,
        wbRef
      );
    }
  }
  if (!settings.gameInfo.strict) {
    if (
      raceState.prevKey === " " &&
      (raceState.prevInput !== raceState.words[prevRaceState.wordsTyped] ||
        !prevRaceState.isCorrect)
    ) {
      if (wbRef.current && wbRef.current.children) {
        const wordElement = wbRef.current.children[prevRaceState.wordsTyped];
        if (wordElement) {
          for (const c of wordElement.children) {
            const charElement = c as HTMLElement;
            if (charElement && charElement.innerHTML !== "&nbsp;") {
              charElement.style.borderBottom = "2px solid red";
              charElement.style.marginBottom = "-2px";
            }
          }
        }
      }
    }
  }
  if (prevRaceState?.currentWordIndex > raceState.currentWordIndex) {
    if (wbRef.current && wbRef.current.children) {
      const wordElement = wbRef.current.children[raceState.wordsTyped];
      if (wordElement) {
        for (const c of wordElement.children) {
          const charElement = c as HTMLElement;
          charElement.style.borderBottom = "none";
          charElement.style.marginBottom = "0";
        }
      }
    }
  }
};

const calculateFollowerPosition = (
  wordsTyped: number,
  passageArray: Array<string>,
  wordBoxRef: React.RefObject<HTMLDivElement>
): { col: number; cot: number; cw: number } => {
  if (
    wordBoxRef.current &&
    wordBoxRef.current.children[1] &&
    wordBoxRef.current.offsetLeft
  ) {
    let wordIndex = wordsTyped;
    let charIndex = 0;
    if (wordIndex >= passageArray.length) {
      wordIndex = passageArray.length - 1;
      charIndex = passageArray[wordIndex].length - 1;
    }
    if (!wordBoxRef.current.children[wordIndex])
      return { col: 0, cot: 0, cw: 0 };
    const charInfo = wordBoxRef.current.children[wordIndex].children[
      charIndex
    ] as HTMLDivElement;
    if (!charInfo) return { col: 0, cot: 0, cw: 0 };
    return {
      col: wordBoxRef.current.offsetLeft + charInfo.offsetLeft - 1,
      cot: wordBoxRef.current.offsetTop + charInfo.offsetTop + 2.5,
      cw: charInfo.offsetWidth + 3,
    };
  }
  return { col: 0, cot: 0, cw: 0 };
};
