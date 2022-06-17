import React from "react";
import { unstable_batchedUpdates } from "react-dom";
import * as RaceAPI from "../../api/rest/race";
import { CharacterData, MAX_INPUT_LENGTH } from "../../constants/race";
import { getPassage } from "../../constants/passages";
import { ResultsData, WPMData } from "../../constants/race";
import {
  GameSettings,
  GameTypeNames,
  GameTypes,
  TextTypeNames,
} from "../../constants/settings";
import { useAuth } from "../../contexts/AuthContext";
import { useSocketContext } from "../../contexts/SocketContext";
import { useInterval } from "../common";
import { CLIENT_RACE_UPDATE_EVENT } from "../../api/sockets/race";
import { useSnackbar } from "notistack";

interface RaceInfo {
  textAreaText: string;
  words: Array<string>;
}

interface RaceStatus {
  isRaceRunning: boolean;
  isRaceFinished: boolean;
  startTime: number;
  secondsRunning: number;
}

export interface RaceState {
  isCorrect: boolean; // Has an error been made and not fixed
  currentCharIndex: number; // The current character the user is on in the passage (Regardless if they are correct or not)
  currentWordIndex: number; // The index of the start of the word the user is currently on (Regardless if they are correct or not)
  correctWordIndex: number; // The index of the start of the word the user is currently on
  errorIndex: number; // The index where the user made an error and must go back to
  errorWordIndexes: {
    wordsTyped: number;
    wordIndex: number;
    charIndex: number;
  }[];
  wordsTyped: number; // The number of words typed (Regardless if they are correct or not)
  charactersTyped: number;
  lastCorrectWord: number; // The index of the last correct word in the words array
  prevInput: string;
  prevKey: string;
  overflowCount: number; // Detect if we have gone past the last character in the passage
  errors: number;
}

interface StatState {
  wpm: number;
  wpmData: WPMData[];
  characterTrackingData: CharacterData[];
  resultsData: ResultsData;
}

const initialRaceState: RaceState = {
  isCorrect: true,
  currentCharIndex: 0,
  currentWordIndex: 0,
  correctWordIndex: 0,
  errorIndex: 0,
  errorWordIndexes: [],
  wordsTyped: 0,
  charactersTyped: 0,
  lastCorrectWord: 0,
  prevInput: "",
  prevKey: "",
  overflowCount: 0,
  errors: 0,
};

const initialRaceStatus: RaceStatus = {
  isRaceRunning: false,
  isRaceFinished: false,
  startTime: 0,
  secondsRunning: 0,
};

const initialStatState: StatState = {
  wpm: 0,
  wpmData: [],
  characterTrackingData: [],
  resultsData: {
    passage: "",
    startTime: 0,
    dataPoints: [],
    accuracy: 0,
    characters: { correct: 0, incorrect: 0, total: 0 },
    testType: { name: "", textType: "" },
    characterDataPoints: [],
  },
};

interface RaceLogicProps {
  settings: GameSettings;
  passage?: string;
  testDisabled?: boolean;
  setResultsDataProp?: (data: ResultsData) => void;
}

export default function useRaceLogic({
  settings,
  passage,
  testDisabled,
  setResultsDataProp,
}: RaceLogicProps) {
  const { currentUser } = useAuth();
  const { socket } = useSocketContext();

  // Race Info
  const [raceInfo, setRaceInfo] = React.useState<RaceInfo>({
    textAreaText: "",
    words: [],
  }); // The time the current race started

  const [raceStatus, setRaceStatus] =
    React.useState<RaceStatus>(initialRaceStatus);

  const [raceState, setRaceState] = React.useState<RaceState>(initialRaceState);

  // WPM Tracking
  const [statState, setStatState] = React.useState<StatState>(initialStatState);

  const [amount, setAmount] = React.useState<number>(0);

  useInterval(
    () => {
      // unstable_batchedUpdates(() => {
      //   UpdateWPM();
      //   setRaceStatus((prevRaceStatus) => {
      //     if (prevRaceStatus.secondsRunning >= 150) {
      //       // enqueueSnackbar("Race Timeout : 150 Seconds", {
      //       //   variant: "error",
      //       //   anchorOrigin: {
      //       //     vertical: "top",
      //       //     horizontal: "right",
      //       //   },
      //       // });
      //       OnEndRace();
      //     }
      //     return {
      //       ...prevRaceStatus,
      //       secondsRunning: prevRaceStatus.secondsRunning + 1,
      //     };
      //   });
      //   if (settings.gameInfo.type === GameTypes.TIMED) {
      //     setAmount((prevAmount) => {
      //       return prevAmount - 1;
      //     });
      //   }
      // });
    },
    raceStatus.isRaceRunning ? 1000 : null
  );

  const InitializePassage = () => {
    const textType = settings.textType;
    const gameInfo = settings.gameInfo;

    const practice = settings.gameInfo.practice;

    let newPassage = passage || getPassage(textType, practice);

    if (gameInfo.type === GameTypes.TIMED) {
      newPassage = `${newPassage} ${getPassage(
        textType,
        practice
      )} ${getPassage(textType, practice)} ${getPassage(textType, practice)}`;
    }

    let newWords = newPassage.split(" ");

    if (gameInfo.type === GameTypes.WORDS) {
      while (newWords.length < gameInfo.amount!) {
        newWords = [...newWords, ...getPassage(textType, practice).split(" ")];
      }
      newWords.length = gameInfo.amount || 0;
    }
    console.log(newWords);
    setRaceInfo({
      textAreaText: newWords.join(" ").trim(),
      words: newWords,
    });
  };

  const AddPasageLength = () => {
    const textType = settings.textType;

    const practice = settings.gameInfo.practice;

    const newTextAreaText = `${raceInfo.textAreaText} ${getPassage(
      textType,
      practice
    )} ${getPassage(textType, practice)}`;

    setRaceInfo({
      ...raceInfo,
      textAreaText: newTextAreaText,
      words: newTextAreaText.split(" "),
    });
  };

  const OnStartRace = () => {
    setRaceStatus({
      isRaceRunning: true,
      isRaceFinished: false,
      startTime: Date.now(),
      secondsRunning: 0,
    });
  };

  const OnEndRace = () => {
    UpdateWPM();
    setRaceStatus({
      ...raceStatus,
      isRaceRunning: false,
      isRaceFinished: true,
    });
    const correctCharacters = raceState.currentCharIndex - raceState.errors;
    const accuracy = (correctCharacters / raceState.currentCharIndex) * 100;
    setStatState((prevStatState) => {
      const resultsData = {
        passage: raceInfo.textAreaText,
        startTime: raceStatus.startTime,
        dataPoints: prevStatState.wpmData,
        accuracy: accuracy,
        characters: {
          correct: correctCharacters,
          incorrect: raceState.errors,
          total: raceState.currentCharIndex,
        },
        testType: {
          name: GameTypeNames[settings.gameInfo.type],
          amount: settings.gameInfo.amount,
          textType: TextTypeNames[settings.textType],
        },
        characterDataPoints: prevStatState.characterTrackingData,
      };

      try {
        RaceAPI.sendRaceData(currentUser, resultsData);
      } catch (err) {
        console.error(err);
      }

      return {
        ...prevStatState,
        resultsData: resultsData,
      };
    });
  };

  const ResetRace = React.useCallback(
    (shouldRaceStart = false) => {
      setRaceStatus({
        isRaceRunning: false,
        isRaceFinished: false,
        startTime: 0,
        secondsRunning: 0,
      });
      setRaceState(initialRaceState);

      setAmount(settings.gameInfo.amount || 0);

      setStatState({
        wpm: 0,
        characterTrackingData: [],
        wpmData: [],
        resultsData: {
          passage: "",
          startTime: 0,
          dataPoints: [],
          accuracy: 0,
          characters: { correct: 0, incorrect: 0, total: 0 },
          testType: { name: "", textType: "" },
          characterDataPoints: [],
        },
      });

      if (shouldRaceStart) OnStartRace();
      else InitializePassage();
    },
    [settings]
  );

  const UpdateWPM = () => {
    const charactersTyped = settings.gameInfo.strict
      ? raceState.isCorrect
        ? raceState.currentCharIndex
        : raceState.errorIndex
      : raceState.charactersTyped;

    const wpm =
      (charactersTyped / 5 / (Date.now() - raceStatus.startTime)) * 60000;
    setStatState((prevStatState) => {
      return {
        ...prevStatState,
        wpm: +wpm.toFixed(1),
        wpmData: [
          ...prevStatState.wpmData,
          { wpm: wpm, timestamp: Date.now() },
        ],
      };
    });
  };

  const HandleDeletion = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>,
    newRaceState: RaceState
  ) => {
    const inputRef = event.target as HTMLInputElement;
    if (raceState.currentCharIndex > raceState.correctWordIndex) {
      if (raceState.currentCharIndex === 0) return;
      if (
        raceState.isCorrect &&
        raceState.currentCharIndex !== raceState.currentWordIndex
      ) {
        newRaceState.currentCharIndex--;
        newRaceState.charactersTyped--;
      } else {
        const { wordsTyped, wordIndex, charIndex } =
          raceState.errorWordIndexes[raceState.errorWordIndexes.length - 1];
        newRaceState.currentCharIndex = charIndex;
        newRaceState.wordsTyped = wordsTyped;
        newRaceState.currentWordIndex = wordIndex;

        inputRef.value = (raceInfo.words[wordsTyped] + " ").substring(
          0,
          charIndex - wordIndex
        );
        event.preventDefault();

        newRaceState.charactersTyped += inputRef.value.length;
      }
      newRaceState.overflowCount = 0;
      // newRaceState.currentCharIndex--;
      // // Going back to a new word
      // if (raceInfo.textAreaText[raceState.currentCharIndex - 1] === " ") {
      //   newRaceState.currentCharIndex--;
      //   newRaceState.wordsTyped--;
      //   newRaceState.currentWordIndex =
      //     raceState.currentCharIndex -
      //     raceInfo.words[raceState.wordsTyped - 1].length -
      //     1;
      // }
    }
    // } else if (raceState.overflowCount === 1) {
    //   newRaceState.overflowCount = 0;
    // } else {
    //   newRaceState.overflowCount--;
    // }

    // If we go back past where an error was made, we have corrected it
    if (newRaceState.currentCharIndex <= raceState.errorIndex) {
      const errorIndexes = newRaceState.errorWordIndexes;
      const newErrorIndexes = errorIndexes.slice(0, errorIndexes.length - 1);
      newRaceState.errorWordIndexes = newErrorIndexes;
      newRaceState.errorIndex =
        newErrorIndexes[newErrorIndexes.length - 1]?.charIndex || 0;
      newRaceState.isCorrect = true;
    }
  };

  const OnChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = event.target.value;
      const inputRef = event.target as HTMLInputElement;
      // Handle multi-character deletion
      // prettier-ignore
      if (
        raceState.prevInput.length - inputVal.length > 1 && raceState.prevKey !== "Backspace"
      ) {
        const newRaceState = {...raceState};
        HandleDeletion(event, newRaceState)
        newRaceState.isCorrect = true;
        setRaceState(newRaceState);
      }
      if (
        // If we have reached the end of the passage and we are correct, end the race
        inputVal === raceInfo.words[raceState.wordsTyped] &&
        raceState.isCorrect &&
        raceState.currentCharIndex >= raceInfo.textAreaText.length - 1
      ) {
        if (settings.online) {
          socket.emit(
            CLIENT_RACE_UPDATE_EVENT,
            raceState.currentCharIndex + 1,
            raceState.wordsTyped + 1
          );
        }
        setRaceState({
          ...raceState,
          charactersTyped: raceState.charactersTyped + 1,
        });
        console.log("Ending Race On Change");
        if (
          amount <= 0 ||
          settings.gameInfo.type === GameTypes.WORDS ||
          settings.gameInfo.type === GameTypes.ERRORS
        )
          OnEndRace();
      }
    },
    [raceInfo, raceState]
  );

  const OnKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const key = event.key;
      const inputRef = event.target as HTMLInputElement;

      const inputVal = inputRef.value;
      if (!raceStatus.isRaceRunning && !raceStatus.isRaceFinished) {
        if (!settings.online) OnStartRace();
      }

      if (raceStatus.isRaceFinished) return;

      const newRaceState = { ...raceState };

      if (!settings.gameInfo.strict && key === " ") {
        if (raceState.wordsTyped === raceInfo.words.length - 1) {
          OnEndRace();
          return;
        }

        const isWordCorrect = inputVal === raceInfo.words[raceState.wordsTyped];

        const nextWordIndex =
          raceState.currentWordIndex +
          raceInfo.words[raceState.wordsTyped].length +
          1;

        newRaceState.currentCharIndex = nextWordIndex;
        newRaceState.currentWordIndex = nextWordIndex;
        if (isWordCorrect) {
          newRaceState.correctWordIndex = nextWordIndex;
          newRaceState.lastCorrectWord = newRaceState.wordsTyped + 1;
          newRaceState.charactersTyped++;
        }

        newRaceState.wordsTyped++;
        if (raceState.isCorrect && !isWordCorrect) {
          newRaceState.errorIndex = raceState.currentCharIndex;
          newRaceState.errorWordIndexes = [
            ...newRaceState.errorWordIndexes,
            {
              wordIndex: raceState.currentWordIndex,
              wordsTyped: raceState.wordsTyped,
              charIndex: raceState.currentCharIndex,
            },
          ];
        }
        newRaceState.overflowCount = 0;
        newRaceState.isCorrect = true;
        newRaceState.prevInput = inputVal;
        newRaceState.prevKey = key;

        if (!isWordCorrect) {
          newRaceState.charactersTyped -=
            newRaceState.errorIndex - raceState.currentWordIndex;
        }

        inputRef.value = "";
        event.preventDefault();
        setRaceState(newRaceState);

        return;
      }

      if (key === "Backspace") {
        // We shouldn't be able to go back past the current word we are on unless we aren't in strict mode
        // if (raceState.overflowCount < 1) {
        HandleDeletion(event, newRaceState);
      } else {
        // Keys like alt and ctrl should be ignored for now
        if (
          key.length !== 1 ||
          event.ctrlKey ||
          inputVal.length >= MAX_INPUT_LENGTH
        )
          return;

        if (raceState.isCorrect) {
          // We have misstyped a character
          if (
            key !== raceInfo.textAreaText.charAt(raceState.currentCharIndex)
          ) {
            newRaceState.errorIndex = raceState.currentCharIndex;
            newRaceState.errorWordIndexes = [
              ...newRaceState.errorWordIndexes,
              {
                wordsTyped: raceState.wordsTyped,
                wordIndex: raceState.currentWordIndex,
                charIndex: raceState.currentCharIndex,
              },
            ];
            newRaceState.lastCorrectWord = raceState.wordsTyped;
            newRaceState.isCorrect = false;
            newRaceState.errors++;

            // Increment the word trackers even if we are wrong on a space
            if (
              raceInfo.textAreaText.charAt(raceState.currentCharIndex) ===
                " " &&
              settings.gameInfo.strict
            ) {
              newRaceState.currentWordIndex = raceState.currentCharIndex + 1;
              newRaceState.wordsTyped++;
            }
          }
          // We have successfully typed a character correctly
          else if (raceInfo.words[raceState.wordsTyped].startsWith(inputVal)) {
            if (key === " ") {
              if (settings.online)
                socket.emit(
                  CLIENT_RACE_UPDATE_EVENT,
                  raceState.currentCharIndex + 1,
                  raceState.wordsTyped + 1
                );
              newRaceState.correctWordIndex = raceState.currentCharIndex + 1;
              newRaceState.lastCorrectWord = raceState.wordsTyped + 1;
              newRaceState.currentWordIndex = raceState.currentCharIndex + 1;
              newRaceState.wordsTyped++;
              inputRef.value = "";
              event.preventDefault();
            }
          }
        }
        // If we are not correct
        else {
          // Increment the word trackers even if we are wrong on a space
          if (
            raceInfo.textAreaText.charAt(raceState.currentCharIndex) === " " &&
            settings.gameInfo.strict
          ) {
            newRaceState.currentWordIndex = raceState.currentCharIndex + 1;
            newRaceState.wordsTyped++;
          }
        }

        // Always increment currentCharIndex if we have typed a letter unless we are at the end of the passage
        const wordEnd =
          raceState.currentWordIndex +
          raceInfo.words[raceState.wordsTyped].length;
        // prettier-ignoret
        if (
          raceState.currentCharIndex >= raceInfo.textAreaText.length - 1 ||
          (!settings.gameInfo.strict && raceState.currentCharIndex >= wordEnd)
        ) {
          newRaceState.overflowCount++;
        } else {
          newRaceState.currentCharIndex++;
          if (newRaceState.isCorrect) newRaceState.charactersTyped++;
        }
      }

      newRaceState.prevInput = inputVal;
      newRaceState.prevKey = key;
      setRaceState(newRaceState);
    },
    [raceInfo, raceStatus.isRaceRunning, raceStatus.isRaceFinished, raceState]
  );

  const addCharacterDataPoint = () => {
    if (!raceStatus.isRaceRunning) return;
    setStatState((prevStatState) => {
      return {
        ...prevStatState,
        characterTrackingData: [
          ...prevStatState.characterTrackingData,
          {
            charIndex: raceState.currentCharIndex - 1,
            character: raceState.prevKey,
            isCorrect: raceState.isCorrect,
            timestamp: Date.now(),
          },
        ],
      };
    });
  };

  React.useEffect(() => {
    ResetRace(false);
  }, [settings, passage]);

  React.useEffect(() => {
    const gameInfo = settings.gameInfo;
    if (gameInfo.type === GameTypes.ERRORS && gameInfo.amount) {
      setAmount(gameInfo.amount - raceState.errors);
    }
  }, [raceState.errors]);

  React.useEffect(() => {
    const gameInfo = settings.gameInfo;
    if (gameInfo.type === GameTypes.WORDS && gameInfo.amount) {
      if (raceState.isCorrect) {
        setAmount(gameInfo.amount - raceState.wordsTyped);
      }
    }

    if (
      gameInfo.type === GameTypes.TIMED &&
      raceInfo.words.length - raceState.wordsTyped < 20
    )
      AddPasageLength();
  }, [raceState.wordsTyped]);

  React.useEffect(() => {
    if (settings.online && testDisabled === false) {
      OnStartRace();
    }
  }, [testDisabled]);

  React.useEffect(() => {
    if (amount <= 0 && raceStatus.isRaceRunning) {
      console.log("Ending Race On Amounts");
      OnEndRace();
    }
  }, [amount]);

  React.useEffect(() => {
    if (setResultsDataProp) setResultsDataProp(statState.resultsData);
  }, [statState.resultsData]);

  React.useEffect(() => {
    if (raceState.prevKey.length > 1) return;
    addCharacterDataPoint();
  }, [raceState.currentCharIndex]);

  const val: RaceLogic = {
    raceInfo,
    raceStatus,
    raceState,
    statState,
    amount,
    OnChange,
    OnKeyDown,
    ResetRace,
  };

  return val;
}

export interface RaceLogic {
  raceInfo: RaceInfo;
  raceStatus: RaceStatus;
  raceState: RaceState;
  statState: StatState;
  amount: number;
  OnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  OnKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  ResetRace: (shouldRaceStart: boolean) => void;
}
