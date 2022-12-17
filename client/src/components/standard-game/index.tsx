import React from "react";
import { GridCard } from "components/common";
import Follower from "components/standard-game/feedback/follower";
import WordBox from "components/standard-game/word-box";
import { GameSettings, RaceTypes } from "constants/settings";
import { useAuth } from "contexts/AuthContext";
import Results from "components/standard-game/results/standard-results";
import { MAX_INPUT_LENGTH, ResultsData } from "constants/race";
import { OnlineRaceData, PLAYER_COLORS } from "components/multiplayer/ffa-game";
import useRaceLogic, {
  RaceState,
} from "components/standard-game/hooks/RaceLogic";
import SpeedProgress from "components/standard-game/feedback/speed-progress";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Box,
  Grid,
  IconButton,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const usePreviousRaceState = (value: RaceState): RaceState | undefined => {
  const ref = React.useRef<RaceState>();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

interface StandardGameProps {
  settings: GameSettings;
  testDisabled?: boolean;
  onlineRaceData?: OnlineRaceData;
  setResultsDataProp?: (data: ResultsData) => void;
  passage?: string;
}

export default function StandardGame({
  settings,
  testDisabled,
  onlineRaceData,
  passage,
}: StandardGameProps) {
  const { currentUser } = useAuth();

  const { raceState, raceStateDispatch } = useRaceLogic({
    settings,
    testDisabled,
    passage,
  });

  const prevRaceState = usePreviousRaceState(raceState);
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
        passage,
      });

      StyleReset();
    },
    [settings, passage]
  );

  React.useEffect(() => {
    if (!testDisabled) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [testDisabled]);

  React.useEffect(() => {
    StyleReset();
  }, [settings.gameInfo, settings.textType]);

  React.useEffect(() => {
    if (raceState.isRaceFinished) {
      StyleReset();
      if (settings.raceType === RaceTypes.ONLINE) {
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
    let isMounted = true;

    clearTimeout(focusTimeout);
    if (isFocused) {
      if (wbRef.current) {
        wbRef.current.style.filter = "none";
      }
      setFocusMessageOpen(false);
    } else {
      const timeout = window.setTimeout(() => {
        if (isMounted) {
          setFocusMessageOpen(true);
          if (wbRef.current) {
            wbRef.current.style.filter = "blur(2px)";
          }
        }
      }, 1000);

      setFocusTimeout(timeout);
    }

    return () => {
      isMounted = false;
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

  const smScreenSize = useMediaQuery(theme.breakpoints.up("sm"));
  const xsScreenSize = useMediaQuery(theme.breakpoints.down("vs"));

  const AmountDisplay = React.useMemo(() => {
    return (
      <GridCard
        noStyle={!smScreenSize}
        sx={{
          display: "flex",
          flex: { xs: null, sm: "0 0 5em" },
          justifyContent: "space-between",
          flexDirection: { xs: "row", sm: "column" },
          alignItems: { xs: "flex-end", sm: "center" },
          textAlign: "center",
          gap: 3,
          py: { xs: 0, sm: 2 },
          px: 0,
        }}
      >
        <Box
          width={{ xs: "fit-content", sm: "100%" }}
          sx={{ borderBottom: { xs: "none", sm: "1px solid #696969" } }}
          pb={{ xs: 0, sm: 2 }}
        >
          <GridCard
            noStyle={smScreenSize}
            textalign="center"
            sx={{
              width: { xs: "fit-content", sm: "100%" },
              minWidth: { xs: "4em", sm: 0 },
            }}
          >
            <Typography variant="h5" color="primary.main">
              {raceState.amount}
            </Typography>
          </GridCard>
        </Box>
        {settings.display.showWPM && (
          <Box>
            <GridCard
              noStyle={smScreenSize}
              sx={{
                width: { xs: "fit-content", sm: "100%" },
                float: "right",
              }}
            >
              <SpeedProgress wpm={raceState.statState.wpm} />
            </GridCard>
          </Box>
        )}
      </GridCard>
    );
  }, [
    raceState.amount,
    settings.display.showWPM,
    raceState.statState.wpm,
    smScreenSize,
    xsScreenSize,
  ]);

  const MainDisplay = React.useMemo(() => {
    const isOnline = settings.raceType === RaceTypes.ONLINE;
    return (
      <Box
        sx={{ userSelect: "none", flexGrow: 1 }}
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
            onFocus={() => {
              setIsFocused(true);
            }}
            onBlur={() => {
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
                  noBorder
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
              <WordBox
                words={raceState.words}
                boxRef={wbRef}
                settings={settings}
              />
            </>
          )}
          {settings.raceType !== RaceTypes.ONLINE ? (
            <IconButton
              color="secondary"
              onClick={() => Reset(false)}
              sx={{ zIndex: 999 }}
            >
              <RestartAltIcon />
            </IconButton>
          ) : null}
        </GridCard>
      </Box>
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

  const OnlineFollowersDisplay = React.useMemo(() => {
    return (
      <>
        {onlineRaceData
          ? onlineRaceData.playerData.map((player, index) => {
              if (player.id === currentUser.uid) return null;

              return (
                <Follower
                  key={player.id}
                  wbContainerRef={wbContainerRef}
                  wbRef={wbRef}
                  raceState={{
                    currentCharIndex: player.currentCharIndex,
                    wordsTyped: player.wordsTyped,
                  }}
                  settings={settings}
                  isCorrect={player.isCorrect}
                  isEndOfPassage={
                    player.currentCharIndex === (passage?.length || 0) - 1
                  }
                  color={PLAYER_COLORS[index]}
                />
              );
            })
          : null}
      </>
    );
  }, [onlineRaceData, currentUser.uid]);

  return (
    <>
      {!onlineRaceData ? ResultsDisplay : null}
      <Follower
        wbContainerRef={wbContainerRef}
        wbRef={wbRef}
        raceState={raceState}
        settings={settings}
      />

      {OnlineFollowersDisplay}
      {settings.raceType === RaceTypes.ONLINE ? null : AmountDisplay}
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
  prevRaceState: RaceState | undefined,
  raceState: RaceState,
  wbRef: React.RefObject<HTMLDivElement>,
  theme: Theme,
  settings: GameSettings
) => {
  const prevIsCorrect = prevRaceState?.isCorrect || true;
  const prevCurrentCharIndex = prevRaceState?.currentCharIndex || 0;
  const prevOverflowCount = prevRaceState?.overflowCount || 0;
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
  if (prevOverflowCount > 0 && raceState.overflowCount === 0) {
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
      (raceState.prevInput !== raceState.words[prevWordsTyped] ||
        !prevIsCorrect)
    ) {
      if (wbRef.current && wbRef.current.children) {
        const wordElement = wbRef.current.children[prevWordsTyped];
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
  if (prevCurrentWordIndex > raceState.currentWordIndex) {
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
