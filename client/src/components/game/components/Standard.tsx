import React from "react";
import { useHistory } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import SpeedProgress from "../feedback/SpeedProgress";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { GridCard, StyledTextField } from "../../common";
import { Box, Typography } from "@mui/material";
import Follower from "../feedback/Follower";
import WordBox from "./standardComponents/WordBox";
import { GameSettings, GameTypes } from "../../../constants/settings";
import { useAuth } from "../../../contexts/AuthContext";
import Settings from "./standardComponents/Settings";
import Results from "./results/Results";
import { MAX_INPUT_LENGTH, ResultsData } from "../../../constants/race";
import { OnlineRaceData } from "../types/FFAGame";
import useRaceLogic from "../RaceLogic";
import HomeProfile from "../../profile/display/HomeProfile";
import { useSnackbar } from "notistack";
import TopSettings from "./standardComponents/TopSettings";
import { useTheme } from "@mui/material";

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
  passage?: string;
  testDisabled?: boolean;
  onlineRaceData?: OnlineRaceData;
  setResultsDataProp?: (data: ResultsData) => void;
}

export default function StandardGame({
  settings,
  passage,
  testDisabled,
  onlineRaceData,
  setResultsDataProp,
}: StandardGameProps) {
  const { currentUser } = useAuth();
  const {
    raceInfo,
    raceStatus,
    raceState,
    statState,
    amount,
    OnChange,
    OnKeyDown,
    ResetRace,
  } = useRaceLogic({
    settings,
    passage,
    testDisabled,
    setResultsDataProp,
  });

  const prevRaceState = usePrevious(raceState);
  // Element Details
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [prevInput, setPrevInput] = React.useState<string>("");
  const wbRef = React.useRef<HTMLDivElement>(null);
  const followerRef = React.useRef<HTMLDivElement>(null);
  const [inputDisabled, setInputDisabled] = React.useState<boolean>(false);
  const [ccol, setCCOL] = React.useState<number>(0);
  const [ccot, setCCOT] = React.useState<number>(0);
  const [ccw, setCCW] = React.useState<number>(0);

  const history = useHistory();

  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();

  const styles = {
    letter: {
      display: "inline-block",
    },
    correct: {
      color: theme.palette.secondary.main,
    },
    incorrect: {
      color: theme.palette.error.main,
    },
    incorrect_space: {
      backgroundColor: "rgba(255,0,0,0.25)",
      outline: `1px solid ${theme.palette.error.main}`,
    },
    amountCard: {
      display: "inline-block",
      textAlign: "center",
      padding: "10px",
      paddingLeft: "13px",
      paddingTop: "15px",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
  };

  const Reset = (shouldStartRace: boolean) => {
    ResetRace(shouldStartRace);

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
  };

  const CharStyle = {
    NONE: 0,
    CORRECT: 1,
    INCORRECT: 2,
  };

  const setCharStyle = (
    charStyle: number,
    wordIndex: number,
    index: number
  ) => {
    if (!(wbRef.current && wbRef.current.children[wordIndex])) return;
    const charDiv = wbRef.current.children[wordIndex].children[
      index
    ] as HTMLElement;
    if (!charDiv) return;
    switch (charStyle) {
      case CharStyle.NONE:
        charDiv.style.color = "inherit";
        charDiv.style.backgroundColor = "inherit";
        charDiv.style.outline = "none";
        break;
      case CharStyle.CORRECT:
        charDiv.style.color = styles.correct.color;
        charDiv.style.backgroundColor = "inherit";
        charDiv.style.outline = "none";
        break;
      case CharStyle.INCORRECT:
        if (charDiv.innerHTML === "&nbsp;") {
          charDiv.style.backgroundColor =
            styles.incorrect_space.backgroundColor;
          charDiv.style.outline = styles.incorrect_space.outline;
        } else {
          charDiv.style.color = styles.incorrect.color;
          charDiv.style.backgroundColor = "inherit";
          charDiv.style.outline = "none";
        }
        break;
    }
  };

  const updateFollower = () => {
    if (
      wbRef.current &&
      wbRef.current.children[1] &&
      wbRef.current.offsetLeft
    ) {
      const charInfo = wbRef.current.children[raceState.wordsTyped].children[
        raceState.currentCharIndex - raceState.currentWordIndex
      ] as HTMLDivElement;
      if (!charInfo) return;
      if (charInfo.offsetTop > 155)
        wbRef.current.style.top = `-${charInfo.offsetTop - 149}px`;
      setCCOL(wbRef.current.offsetLeft + charInfo?.offsetLeft - 1);
      setCCOT(wbRef.current.offsetTop + charInfo?.offsetTop - 2.5);
      setCCW(charInfo?.offsetWidth + 3);
    }
  };

  React.useEffect(() => {
    const initFollowerInterval = setInterval(() => {
      if (wbRef.current && wbRef.current.children[0]) {
        updateFollower();
        clearInterval(initFollowerInterval);
      }
    }, 100);

    const resizeListener = () => {
      updateFollower();
    };
    // set resize listener
    window.addEventListener("resize", resizeListener);

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  React.useEffect(() => {
    if (raceStatus.isRaceFinished) {
      if (inputRef.current) inputRef.current.value = "";
      if (settings.online) {
        setInputDisabled(true);
      }
    }
  }, [raceStatus.isRaceFinished]);

  React.useEffect(() => {
    updateFollower();

    const prevCurrentCharIndex = prevRaceState?.currentCharIndex || 0;
    const prevCurrentWordIndex = prevRaceState?.currentWordIndex || 0;
    const prevWordsTyped = prevRaceState?.wordsTyped || 0;
    const characterDifference =
      raceState.currentCharIndex - prevCurrentCharIndex;

    if (characterDifference === 1) {
      if (!raceState.isCorrect || raceState.prevKey !== " ") {
        setCharStyle(
          raceState.isCorrect ? CharStyle.CORRECT : CharStyle.INCORRECT,
          prevWordsTyped,
          prevCurrentCharIndex - prevCurrentWordIndex
        );
      }
    } else if (characterDifference === -1) {
      setCharStyle(
        CharStyle.NONE,
        raceState.wordsTyped,
        raceState.currentCharIndex - raceState.currentWordIndex
      );
    } else if (characterDifference < -1) {
      let currentWordsTyped = raceState.wordsTyped;
      let letterIndex = raceState.currentCharIndex - raceState.currentWordIndex;
      for (let i = raceState.currentCharIndex; i <= prevCurrentCharIndex; i++) {
        setCharStyle(CharStyle.NONE, currentWordsTyped, letterIndex);
        if (raceInfo.textAreaText[i] === " ") {
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
            raceState.currentCharIndex - raceState.currentWordIndex - 1
          );
        } else {
          setCharStyle(
            CharStyle.CORRECT,
            raceState.wordsTyped,
            raceState.currentCharIndex - raceState.currentWordIndex - 1
          );
        }
      }
    }

    if (raceState.overflowCount > 0 && !raceState.isCorrect) {
      setCharStyle(
        CharStyle.INCORRECT,
        raceState.wordsTyped,
        raceState.currentCharIndex - raceState.currentWordIndex
      );
    }
    if (prevRaceState?.overflowCount > 0 && raceState.overflowCount === 0) {
      if (prevRaceState?.wordsTyped === raceState.wordsTyped) {
        setCharStyle(
          CharStyle.NONE,
          prevRaceState.wordsTyped,
          prevRaceState.currentCharIndex - prevRaceState.currentWordIndex
        );
      }
    }

    if (!settings.gameInfo.strict) {
      if (
        raceState.prevKey === " " &&
        raceState.prevInput !== raceInfo.words[prevRaceState.wordsTyped]
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
  }, [
    raceState.currentCharIndex,
    raceState.overflowCount,
    raceState.isCorrect,
  ]);

  React.useEffect(() => {
    if (testDisabled === false) Reset(true);
  }, [testDisabled]);

  React.useEffect(() => {
    updateFollower();
  }, [onlineRaceData?.playerData?.length, onlineRaceData?.finisherData.length]);

  React.useEffect(() => {
    Reset(false);
  }, [settings]);

  return (
    <Box>
      {!settings.online ? (
        <Results
          open={raceStatus.isRaceFinished}
          setOpen={Reset}
          data={statState.resultsData}
        />
      ) : null}
      <Grid container spacing={3}>
        {!settings.online ? (
          <>
            <Grid item xs={2} position="relative">
              <Box position="absolute" bottom={0}>
                <HomeProfile />
              </Box>
            </Grid>
            <Grid item xs={6} textAlign="center">
              <Card sx={styles.amountCard} elevation={15}>
                <Typography variant="h4">{amount}</Typography>
              </Card>
            </Grid>
            <Grid item xs={2} position="relative">
              <Box position="absolute" bottom={0} right={0}>
                <TopSettings />
              </Box>
            </Grid>
          </>
        ) : null}
        <Grid item xs={settings.online ? 12 : 10}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <GridCard accent={true}>
                {testDisabled && settings.gameInfo.practice.isPractice ? (
                  <Typography textAlign="center" height={300} pt={15}>
                    Select keys or sequences to add/remove them from your
                    practice
                  </Typography>
                ) : (
                  <>
                    <WordBox words={raceInfo.words} boxRef={wbRef} />
                    {/* <Follower
                      disabled={!raceStatus.isRaceRunning}
                      ccol={ccol}
                      ccot={ccot}
                      ccw={ccw}
                    /> */}
                  </>
                )}
                {onlineRaceData
                  ? onlineRaceData.playerData.map((player) => {
                      if (player.id === currentUser.uid) return null;
                      const { col, cot, cw } = calculateFollowerPosition(
                        player.wordsTyped,
                        raceInfo.words,
                        wbRef
                      );
                      return (
                        <Follower
                          key={player.id}
                          ccol={col}
                          ccot={cot}
                          ccw={cw}
                        />
                      );
                    })
                  : null}
                <SpeedProgress wpm={statState.wpm} />
              </GridCard>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={10}>
              <GridCard accent={true} sx={{ display: "flex" }}>
                <StyledTextField
                  style={{
                    padding: "10px",
                    flexGrow: 1,
                  }}
                  inputProps={{
                    maxLength: MAX_INPUT_LENGTH,
                    style: { textAlign: "center" },
                  }}
                  variant="standard"
                  required
                  id="type"
                  fullWidth
                  placeholder="Type Here ..."
                  name="type"
                  fontSize="15pt"
                  autoComplete="off"
                  onKeyDown={OnKeyDown}
                  onChange={OnChange}
                  onFocus={React.useCallback(
                    (e: React.ChangeEvent<HTMLInputElement>) =>
                      (e.target.placeholder = ""),
                    []
                  )}
                  onBlur={React.useCallback(
                    (e: React.ChangeEvent<HTMLInputElement>) =>
                      (e.target.placeholder = "Type Here ..."),
                    []
                  )}
                  disabled={inputDisabled || testDisabled}
                  inputRef={inputRef}
                />
                {!settings.online ? (
                  <Button
                    color="secondary"
                    onClick={() => Reset(false)}
                    sx={{ display: "inline-block" }}
                  >
                    <RestartAltIcon />
                  </Button>
                ) : null}
              </GridCard>
            </Grid>
          </Grid>
        </Grid>

        {!settings.online ? (
          <Grid item xs={2}>
            {/* <Button
              variant="contained"
              fullWidth
              sx={{ mb: 3, p: 1, fontSize: "0.9em" }}
              onClick={() => history.push("/online")}
            >
              Find Online Match
            </Button> */}
            <Settings />
          </Grid>
        ) : null}
      </Grid>
    </Box>
  );
}

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
