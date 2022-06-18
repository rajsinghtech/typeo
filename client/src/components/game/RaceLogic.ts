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
import { GuestUser, useAuth } from "../../contexts/AuthContext";
import { useSocketContext } from "../../contexts/SocketContext";
import { useInterval } from "../common";
import { CLIENT_RACE_UPDATE_EVENT } from "../../api/sockets/race";
import { useSnackbar } from "notistack";
import { User } from "firebase/auth";

export interface RaceState {
  textAreaText: string;
  words: Array<string>;
  amount: number;
  isRaceRunning: boolean;
  isRaceFinished: boolean;
  startTime: number;
  secondsRunning: number;
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
  statState: StatState;
}

interface StatState {
  wpm: number;
  wpmData: WPMData[];
  characterTrackingData: CharacterData[];
  resultsData: ResultsData;
}

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

const initialRaceState: RaceState = {
  textAreaText: "",
  words: [],
  amount: 0,
  isRaceRunning: false,
  isRaceFinished: false,
  startTime: 0,
  secondsRunning: 0,
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
  statState: initialStatState,
};

const InitializePassage = (
  raceState: RaceState,
  settings: GameSettings
): RaceState => {
  const textType = settings.textType;
  const gameInfo = settings.gameInfo;

  const practice = settings.gameInfo.practice;

  let newPassage = getPassage(textType, practice);

  if (gameInfo.type === GameTypes.TIMED) {
    newPassage = `${newPassage} ${getPassage(textType, practice)} ${getPassage(
      textType,
      practice
    )} ${getPassage(textType, practice)}`;
  }

  let newWords = newPassage.split(" ");

  if (gameInfo.type === GameTypes.WORDS) {
    while (newWords.length < gameInfo.amount!) {
      newWords = [...newWords, ...getPassage(textType, practice).split(" ")];
    }
    newWords.length = gameInfo.amount || 0;
  }

  return {
    ...raceState,
    textAreaText: newWords.join(" ").trim(),
    words: newWords,
  };
};

const AddPasageLength = (
  raceState: RaceState,
  settings: GameSettings
): RaceState => {
  const textType = settings.textType;

  const practice = settings.gameInfo.practice;

  const newTextAreaText = `${raceState.textAreaText} ${getPassage(
    textType,
    practice
  )} ${getPassage(textType, practice)}`;

  return {
    ...raceState,
    textAreaText: newTextAreaText,
    words: newTextAreaText.split(" "),
  };
};

const UpdateWPM = (raceState: RaceState, settings: GameSettings): RaceState => {
  const charactersTyped = settings.gameInfo.strict
    ? raceState.isCorrect
      ? raceState.currentCharIndex
      : raceState.errorIndex
    : raceState.charactersTyped;

  const wpm =
    (charactersTyped / 5 / (Date.now() - raceState.startTime)) * 60000;
  const newStatState = {
    ...raceState.statState,
    wpm: +wpm.toFixed(1),
    wpmData: [
      ...raceState.statState.wpmData,
      { wpm: wpm, timestamp: Date.now() },
    ],
  };

  return { ...raceState, statState: newStatState };
};

const OnStartRace = (raceState: RaceState): RaceState => {
  return {
    ...raceState,
    isRaceRunning: true,
    isRaceFinished: false,
    startTime: Date.now(),
    secondsRunning: 0,
  };
};

const OnEndRace = (
  raceState: RaceState,
  settings: GameSettings,
  currentUser: User | GuestUser
): RaceState => {
  raceState = UpdateWPM(raceState, settings);

  const correctCharacters = raceState.currentCharIndex - raceState.errors;
  const accuracy = (correctCharacters / raceState.currentCharIndex) * 100;
  const newStatState = {
    ...raceState.statState,
    resultsData: {
      passage: raceState.textAreaText,
      startTime: raceState.startTime,
      dataPoints: raceState.statState.wpmData,
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
      characterDataPoints: raceState.statState.characterTrackingData,
    },
  };

  try {
    RaceAPI.sendRaceData(currentUser, newStatState.resultsData);
  } catch (err) {
    console.error(err);
  }

  return {
    ...raceState,
    isRaceRunning: false,
    isRaceFinished: true,
    statState: newStatState,
  };
};

const ResetRace = (
  shouldRaceStart = false,
  settings: GameSettings
): RaceState => {
  const newRaceState = { ...initialRaceState };
  newRaceState.amount = settings.gameInfo.amount || 0;
  if (shouldRaceStart) return OnStartRace(newRaceState);
  else return InitializePassage(newRaceState, settings);
};

const HandleDeletion = (
  event: React.ChangeEvent<HTMLInputElement> | KeyboardEvent,
  raceState: RaceState
): RaceState => {
  const newRaceState = { ...raceState };
  const inputRef = event.target as HTMLInputElement;
  if (raceState.currentCharIndex > raceState.correctWordIndex) {
    if (raceState.currentCharIndex === 0) return newRaceState;
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

      inputRef.value = (raceState.words[wordsTyped] + " ").substring(
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
  return newRaceState;
};

const OnChange = (
  raceState: RaceState,
  event: React.ChangeEvent<HTMLInputElement>,
  settings: GameSettings,
  currentUser: User | GuestUser
): RaceState => {
  const inputVal = event.target.value;
  const inputRef = event.target as HTMLInputElement;
  // Handle multi-character deletion
  // prettier-ignore
  if (
      raceState.prevInput.length - inputVal.length > 1 && raceState.prevKey !== "Backspace"
    ) {
      raceState = HandleDeletion(event, raceState);
      raceState.isCorrect = true;
      return raceState;
    }
  if (
    // If we have reached the end of the passage and we are correct, end the race
    inputVal === raceState.words[raceState.wordsTyped] &&
    raceState.isCorrect &&
    raceState.currentCharIndex >= raceState.textAreaText.length - 1
  ) {
    // if (settings.online) {
    //   socket.emit(
    //     CLIENT_RACE_UPDATE_EVENT,
    //     raceState.currentCharIndex + 1,
    //     raceState.wordsTyped + 1
    //   );
    // }
    console.log("Ending Race On Change");
    return OnEndRace(
      {
        ...raceState,
        charactersTyped: raceState.charactersTyped + 1,
      },
      settings,
      currentUser
    );
  }
  return raceState;
};

const OnKeyDown = (
  raceState: RaceState,
  settings: GameSettings,
  event: KeyboardEvent,
  currentUser: User | GuestUser
): RaceState => {
  const key = event.key;
  const inputRef = event.target as HTMLInputElement;
  const inputVal = inputRef.value;

  let newRaceState = { ...raceState };

  if (!raceState.isRaceRunning && !raceState.isRaceFinished) {
    if (!settings.online) newRaceState = OnStartRace(raceState);
  }

  if (raceState.isRaceFinished) return raceState;

  if (!settings.gameInfo.strict && key === " ") {
    if (raceState.wordsTyped === raceState.words.length - 1) {
      return OnEndRace(raceState, settings, currentUser);
    }

    const isWordCorrect = inputVal === raceState.words[raceState.wordsTyped];

    const nextWordIndex =
      raceState.currentWordIndex +
      raceState.words[raceState.wordsTyped].length +
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
    return newRaceState;
  }

  if (key === "Backspace") {
    // We shouldn't be able to go back past the current word we are on unless we aren't in strict mode
    // if (raceState.overflowCount < 1) {
    newRaceState = HandleDeletion(event, newRaceState);
  } else {
    // Keys like alt and ctrl should be ignored for now
    if (
      key.length !== 1 ||
      event.ctrlKey ||
      inputVal.length >= MAX_INPUT_LENGTH
    )
      return raceState;

    if (raceState.isCorrect) {
      // We have misstyped a character
      if (key !== raceState.textAreaText.charAt(raceState.currentCharIndex)) {
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
          raceState.textAreaText.charAt(raceState.currentCharIndex) === " " &&
          settings.gameInfo.strict
        ) {
          newRaceState.currentWordIndex = raceState.currentCharIndex + 1;
          newRaceState.wordsTyped++;
        }
      }
      // We have successfully typed a character correctly
      else if (raceState.words[raceState.wordsTyped].startsWith(inputVal)) {
        if (key === " ") {
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
        raceState.textAreaText.charAt(raceState.currentCharIndex) === " " &&
        settings.gameInfo.strict
      ) {
        newRaceState.currentWordIndex = raceState.currentCharIndex + 1;
        newRaceState.wordsTyped++;
      }
    }

    // Always increment currentCharIndex if we have typed a letter unless we are at the end of the passage
    const wordEnd =
      raceState.currentWordIndex + raceState.words[raceState.wordsTyped].length;
    // prettier-ignoret
    if (
      raceState.currentCharIndex >= raceState.textAreaText.length - 1 ||
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
  return newRaceState;
};

const IncrementSeconds = (
  raceState: RaceState,
  settings: GameSettings,
  currentUser: User | GuestUser
): RaceState => {
  raceState = UpdateWPM(raceState, settings);
  if (settings.gameInfo.type === GameTypes.TIMED) {
    raceState.amount = raceState.amount - 1;
  }
  if (raceState.secondsRunning >= 150) {
    // enqueueSnackbar("Race Timeout : 150 Seconds", {
    //   variant: "error",
    //   anchorOrigin: {
    //     vertical: "top",
    //     horizontal: "right",
    //   },
    // });
    return OnEndRace(raceState, settings, currentUser);
  }
  return {
    ...raceState,
    secondsRunning: raceState.secondsRunning + 1,
  };
};

const SetAmount = (raceState: RaceState, amount: number): RaceState => {
  raceState.amount = amount;
  return raceState;
};

const AddCharacterDataPoint = (raceState: RaceState): RaceState => {
  if (!raceState.isRaceRunning) return raceState;
  const newStatState = {
    ...raceState.statState,
    characterTrackingData: [
      ...raceState.statState.characterTrackingData,
      {
        charIndex: raceState.currentCharIndex - 1,
        character: raceState.prevKey,
        isCorrect: raceState.isCorrect,
        timestamp: Date.now(),
      },
    ],
  };

  return { ...raceState, statState: newStatState };
};

interface OnChangeAction {
  type: "onChange";
  event: React.ChangeEvent<HTMLInputElement>;
  settings: GameSettings;
  currentUser: User | GuestUser;
}

interface KeydownAction {
  type: "keydown";
  settings: GameSettings;
  event: KeyboardEvent;
  currentUser: User | GuestUser;
}

interface StartRaceAction {
  type: "startRace";
}

interface EndRaceAction {
  type: "endRace";
  settings: GameSettings;
  currentUser: User | GuestUser;
}

interface ResetAction {
  type: "reset";
  shouldStartRace: boolean;
  settings: GameSettings;
}

interface AddPassageLengthAction {
  type: "addPassageLength";
  settings: GameSettings;
}

interface IncrementSecondsAction {
  type: "incrementSeconds";
  settings: GameSettings;
  currentUser: User | GuestUser;
}

interface SetAmountAction {
  type: "setAmount";
  amount: number;
}

interface AddCharacterDataPointAction {
  type: "addCharacterDataPoint";
}

export type RaceStateReducerActions =
  | OnChangeAction
  | KeydownAction
  | ResetAction
  | AddPassageLengthAction
  | StartRaceAction
  | EndRaceAction
  | IncrementSecondsAction
  | SetAmountAction
  | AddCharacterDataPointAction;

const RaceStateReducer = (
  state: RaceState,
  action: RaceStateReducerActions
): RaceState => {
  switch (action.type) {
    case "onChange":
      return OnChange(state, action.event, action.settings, action.currentUser);
    case "keydown":
      return OnKeyDown(
        state,
        action.settings,
        action.event,
        action.currentUser
      );
    case "reset":
      return ResetRace(action.shouldStartRace, action.settings);
    case "addPassageLength":
      return AddPasageLength(state, action.settings);
    case "startRace":
      return OnStartRace(state);
    case "endRace":
      return OnEndRace(state, action.settings, action.currentUser);
    case "incrementSeconds":
      return IncrementSeconds(state, action.settings, action.currentUser);
    case "setAmount":
      return SetAmount(state, action.amount);
    case "addCharacterDataPoint":
      return AddCharacterDataPoint(state);
    default:
      throw new Error();
  }
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

  const [raceState, raceStateDispatch] = React.useReducer(
    RaceStateReducer,
    initialRaceState
  );

  useInterval(
    () => {
      raceStateDispatch({ type: "incrementSeconds", settings, currentUser });
    },
    raceState.isRaceRunning ? 1000 : null
  );

  React.useEffect(() => {
    raceStateDispatch({ type: "reset", shouldStartRace: false, settings });
  }, [settings, passage]);

  React.useEffect(() => {
    const gameInfo = settings.gameInfo;
    if (gameInfo.type === GameTypes.ERRORS && gameInfo.amount) {
      raceStateDispatch({
        type: "setAmount",
        amount: gameInfo.amount - raceState.errors,
      });
    }
  }, [raceState.errors]);

  React.useEffect(() => {
    const gameInfo = settings.gameInfo;
    if (gameInfo.type === GameTypes.WORDS && gameInfo.amount) {
      if (raceState.isCorrect) {
        raceStateDispatch({
          type: "setAmount",
          amount: gameInfo.amount - raceState.wordsTyped,
        });
      }
    }

    if (
      gameInfo.type === GameTypes.TIMED &&
      raceState.words.length - raceState.wordsTyped < 20
    )
      raceStateDispatch({ type: "addPassageLength", settings });
  }, [raceState.wordsTyped]);

  React.useEffect(() => {
    if (settings.online && testDisabled === false) {
      raceStateDispatch({ type: "startRace" });
    }
  }, [testDisabled]);

  React.useEffect(() => {
    if (raceState.amount <= 0 && raceState.isRaceRunning) {
      console.log("Ending Race On Amounts");
      raceStateDispatch({ type: "endRace", settings, currentUser });
    }
  }, [raceState.amount]);

  // React.useEffect(() => {
  //   if (setResultsDataProp) setResultsDataProp(statState.resultsData);
  // }, [statState.resultsData]);

  React.useEffect(() => {
    if (raceState.prevKey.length > 1) return;
    raceStateDispatch({ type: "addCharacterDataPoint" });
  }, [raceState.currentCharIndex]);

  const val: RaceLogic = {
    raceState,
    raceStateDispatch,
  };

  return val;
}

export interface RaceLogic {
  raceState: RaceState;
  raceStateDispatch: React.Dispatch<RaceStateReducerActions>;
}
