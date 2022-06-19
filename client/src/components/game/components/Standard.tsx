import React from "react";
import { useHistory } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import SpeedProgress, { calculateWPMColor } from "../feedback/SpeedProgress";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { GridCard, StyledTextField } from "../../common";
import { Box, Theme, Typography } from "@mui/material";
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
  const inputRef = React.useRef<HTMLInputElement>(null);
  const wbRef = React.useRef<HTMLDivElement>(null);
  const [inputDisabled, setInputDisabled] = React.useState<boolean>(false);

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
    (shouldStartRace = false) => {
      raceStateDispatch({
        type: "reset",
        shouldStartRace: shouldStartRace,
        settings,
      });

      StyleReset();
    },
    [settings]
  );

  React.useEffect(() => {
    StyleReset();
  }, [settings]);

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
    settings,
  ]);

  const ResultsDisplay = React.useMemo(() => {
    return (
      <Results
        open={raceState.isRaceFinished}
        setOpen={() => {
          Reset(false);
        }}
        data={raceState.statState.resultsData}
      />
    );
  }, [settings, raceState.isRaceFinished]);

  const AmountDisplay = React.useMemo(() => {
    console.log("AMount Render");
    return (
      <Grid item xs={8} textAlign="center">
        <Card sx={styles.amountCard} elevation={15}>
          <Typography variant="h4">{raceState.amount}</Typography>
        </Card>
      </Grid>
    );
  }, [raceState.amount]);

  const WordBoxDisplay = React.useMemo(() => {
    console.log("Main Render");
    return (
      <Grid item xs={12}>
        <GridCard accent={true}>
          {testDisabled && settings.gameInfo.practice.isPractice ? (
            <Typography textAlign="center" height={300} pt={15}>
              Select keys or sequences to add/remove them from your practice
            </Typography>
          ) : (
            <>
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
        </GridCard>
      </Grid>
    );
  }, [raceState.words]);

  const TextFieldDisplay = React.useMemo(() => {
    return (
      <Grid item xs={12}>
        <GridCard
          accent={true}
          sx={{ display: "flex", width: "85%", margin: "0 auto" }}
        >
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
            onKeyDown={(event: KeyboardEvent) =>
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
            onFocus={(e: React.ChangeEvent<HTMLInputElement>) =>
              (e.target.placeholder = "")
            }
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
              (e.target.placeholder = "Type Here ...")
            }
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
    );
  }, [raceStateDispatch, inputDisabled, testDisabled, settings, currentUser]);

  return (
    <>
      {ResultsDisplay}
      <Follower
        disabled={!raceState.isRaceRunning}
        wbRef={wbRef}
        raceState={raceState}
      />
      <SpeedProgress wpm={raceState.statState.wpm} />
      {AmountDisplay}
      {WordBoxDisplay}
      {TextFieldDisplay}
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
      raceState.prevInput !== raceState.words[prevRaceState.wordsTyped]
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
