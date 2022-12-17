import React from "react";
import * as RaceAPI from "api/rest/race";
import { CharacterData, MAX_INPUT_LENGTH } from "constants/race";
import { getPassage } from "constants/passages";
import { ResultsData, WPMData } from "constants/race";
import {
  GameSettings,
  GameTypeNames,
  GameTypes,
  RaceTypes,
  TextTypeNames,
} from "constants/settings";
import { GuestUser, useAuth } from "contexts/AuthContext";
import { useInterval } from "components/common";
import { User } from "firebase/auth";
import { CLIENT_RACE_UPDATE_EVENT } from "api/sockets/race";
import { useSocketContext } from "contexts/SocketContext";
import { useStats } from "contexts/StatsContext";

export interface RaceState {
  textAreaText: string; // The text as one string
  words: Array<string>; // The text as an array of the word strings (spaces not included)
  amount: number; // The value that tracks the status for the current game mode. For example, it could represent time left, words left, etc.
  isRaceRunning: boolean;
  isRaceFinished: boolean;
  startTime: number; // The timestamp when the test started
  secondsRunning: number; // seconds the test has been running
  isCorrect: boolean; // Has an error been made and not fixed
  currentCharIndex: number; // The current character the user is on in the passage (Regardless if they are correct or not)
  currentWordIndex: number; // The index of the start of the word the user is currently on (Regardless if they are correct or not)
  correctWordIndex: number; // The index of the start of the word the user is currently on
  errorIndex: number; // The index where the user made an error and must go back to
  errorWordIndexes: {
    wordsTyped: number;
    wordIndex: number;
    charIndex: number;
  }[]; // Tracks if multiple errors have been made in a row in the non-strict mode. This is only used in non-strict so they can go back to previous words that are not correct
  wordsTyped: number; // The number of words typed (Regardless if they are correct or not)
  charactersTyped: number; // The number of correct characters typed in the non-strict mode
  lastCorrectWord: number; // The index of the last correct word in the words array
  prevInput: string; // The value that is in the input
  prevKey: string; // The last key pressed
  overflowCount: number; // Detect if we have gone past the last character in the passage or past the end of a word in non-strict mode
  errors: number;
  statState: StatState;
}

export interface RaceStateSubset {
  currentCharIndex: number;
  wordsTyped: number;
  currentWordIndex?: number;
}

interface StatState {
  wpm: number;
  wpmData: WPMData[]; // Array of wpm for each second of the test
  characterTrackingData: CharacterData[]; // Array of every key pressed with its timestamp and if it is correct
  resultsData: ResultsData; // Data to display after the race
}

const initialStatState: StatState = {
  wpm: 0,
  wpmData: [], // Array of wpm for each second
  characterTrackingData: [], // Array of every key pressed with its timestamp and if it is correct
  resultsData: {
    passage: "",
    startTime: 0,
    dataPoints: [], // wpmData
    accuracy: 0,
    characters: { correct: 0, incorrect: 0, total: 0 },
    testType: { name: "", textType: "" },
    characterDataPoints: [], // characterTrackingData
    raceType: RaceTypes.DEFAULT,
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
  settings: GameSettings,
  passage?: string
): RaceState => {
  const textType = settings.textType;
  const gameInfo = settings.gameInfo;

  const practice = settings.gameInfo.practice;

  let newPassage = passage || getPassage(textType, 80, practice);

  // If we are in timed mode we have to add more passage length
  // TODO - make cleaner
  if (gameInfo.type === GameTypes.TIMED) {
    newPassage = `${newPassage} ${getPassage(
      textType,
      80,
      practice
    )} ${getPassage(textType, 80, practice)} ${getPassage(
      textType,
      80,
      practice
    )}`;
  }

  let newWords = newPassage.split(" ");

  if (gameInfo.type === GameTypes.WORDS && gameInfo.amount != undefined) {
    // Keep adding to the text if we are less than the amount of words needed
    while (newWords.length < gameInfo.amount) {
      newWords = [
        ...newWords,
        ...getPassage(textType, 80, practice).split(" "),
      ];
    }
    // This will cut off any extra words added
    newWords.length = gameInfo.amount || 0;
  }

  return {
    ...raceState,
    textAreaText: newWords.join(" ").trim(),
    words: newWords,
  };
};

const AddPassageLength = (
  raceState: RaceState,
  settings: GameSettings
): RaceState => {
  const textType = settings.textType;

  const practice = settings.gameInfo.practice;

  // TODO - make cleaner
  const newTextAreaText = `${raceState.textAreaText} ${getPassage(
    textType,
    80,
    practice
  )} ${getPassage(textType, 80, practice)}`;

  return {
    ...raceState,
    textAreaText: newTextAreaText,
    words: newTextAreaText.split(" "),
  };
};

/**
 * Get the current wpm during the race at any given time
 * @param raceState - The current race state
 * @param settings - The game settings
 * @returns - The updated race state that contains the new stat state
 */
const UpdateWPM = (raceState: RaceState, settings: GameSettings): RaceState => {
  let charactersTyped = raceState.currentCharIndex;

  if (settings.gameInfo.strict && !raceState.isCorrect)
    // This prevents wpm from increasing when the user is not correct
    charactersTyped = raceState.errorIndex;
  else if (!settings.gameInfo.strict)
    // The amount of characters is calculated different for non-strict mode
    charactersTyped = raceState.charactersTyped;

  // To calculated wpm you take the amount of characters / 5, and then divide that by the amount of minutes the test has been running
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

/**
 * End race and calculate results data. Send the results to the server.
 * @param raceState
 * @param settings
 * @param currentUser
 * @returns - Updated race state
 */
const OnEndRace = (
  raceState: RaceState,
  settings: GameSettings,
  currentUser: User | GuestUser
): RaceState => {
  let newRaceState = { ...raceState };
  newRaceState = UpdateWPM(raceState, settings);

  // TODO - This may be inaccurate for non-strict mode
  const correctCharacters = raceState.currentCharIndex - raceState.errors;
  const accuracy = (correctCharacters / raceState.currentCharIndex) * 100;
  const newStatState = {
    ...newRaceState.statState,
    resultsData: {
      passage: newRaceState.textAreaText,
      startTime: newRaceState.startTime,
      dataPoints: newRaceState.statState.wpmData,
      accuracy: accuracy,
      characters: {
        correct: correctCharacters,
        incorrect: newRaceState.errors,
        total: newRaceState.currentCharIndex,
      },
      testType: {
        name: GameTypeNames[settings.gameInfo.type],
        amount: settings.gameInfo.amount,
        textType: TextTypeNames[settings.textType],
      },
      characterDataPoints: newRaceState.statState.characterTrackingData,
      raceType: settings.raceType,
    },
  };

  newRaceState.isRaceRunning = false;
  newRaceState.isRaceFinished = true;
  newRaceState.statState = newStatState;

  return newRaceState;
};

/**
 * Handles initializing a new race
 * @param raceState
 * @param shouldRaceStart - Should we start the race immediately after resetting
 * @param retry - Should we use the same text
 * @param settings
 * @returns - initial race state
 */
const ResetRace = (
  raceState: RaceState,
  shouldRaceStart: boolean,
  retry: boolean,
  settings: GameSettings,
  passage?: string
): RaceState => {
  const newRaceState = { ...initialRaceState };
  if (retry) {
    // Keep existing text
    newRaceState.words = raceState.words;
    newRaceState.textAreaText = raceState.textAreaText;
  }
  newRaceState.amount = settings.gameInfo.amount || 0;
  if (shouldRaceStart) return OnStartRace(newRaceState);
  else if (!retry) return InitializePassage(newRaceState, settings, passage);
  else return newRaceState;
};

/**
 * Logic for deleting character in strict and non-strict mode
 * @param event - Keydown and OnChange event
 * @param raceState
 * @param settings
 * @returns Race state after deletion
 */
const HandleDeletion = (
  event:
    | React.ChangeEvent<HTMLInputElement>
    | React.KeyboardEvent<HTMLInputElement>,
  raceState: RaceState,
  settings: GameSettings
): RaceState => {
  const newRaceState = { ...raceState };
  const inputRef = event.target as HTMLInputElement;

  // Can't go back if the currentCharIndex is less than the correct word
  if (raceState.currentCharIndex > raceState.correctWordIndex) {
    if (raceState.currentCharIndex === 0) return newRaceState;

    // Standard deletion of one character if not at the start of the word
    if (
      (raceState.currentCharIndex !== raceState.correctWordIndex &&
        settings.gameInfo.strict) ||
      (raceState.currentCharIndex !== raceState.currentWordIndex &&
        !settings.gameInfo.strict)
    ) {
      if (raceState.overflowCount > 0) {
        newRaceState.overflowCount--;
      } else {
        newRaceState.currentCharIndex--;
        if (raceState.isCorrect) newRaceState.charactersTyped--;
      }

      if (
        raceState.textAreaText[newRaceState.currentCharIndex] === " " &&
        settings.gameInfo.strict
      ) {
        newRaceState.wordsTyped--;
        newRaceState.currentWordIndex =
          newRaceState.currentCharIndex -
          raceState.words[newRaceState.wordsTyped].length;
      }
    } else if (!settings.gameInfo.strict) {
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
      const errorWordIndexes = raceState.errorWordIndexes;
      const prevError = errorWordIndexes[errorWordIndexes.length - 2];
      const currentError = errorWordIndexes[errorWordIndexes.length - 1];
      if (
        prevError &&
        currentError &&
        prevError.wordIndex === currentError.wordIndex
      ) {
        newRaceState.charactersTyped +=
          prevError.charIndex - prevError.wordIndex;
        newRaceState.isCorrect = false;
      } else {
        newRaceState.charactersTyped += inputRef.value.length;
        newRaceState.isCorrect = true;
      }
      newRaceState.overflowCount = 0;
    }
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
    const errorWordIndexes = raceState.errorWordIndexes;
    const prevError = errorWordIndexes[errorWordIndexes.length - 2];
    const currentError = errorWordIndexes[errorWordIndexes.length - 1];
    if (
      prevError &&
      currentError &&
      prevError.wordIndex === currentError.wordIndex
    ) {
      newRaceState.isCorrect = false;
    } else {
      newRaceState.isCorrect = true;
    }
    const errorIndexes = newRaceState.errorWordIndexes;
    const newErrorIndexes = errorIndexes.slice(0, errorIndexes.length - 1);
    newRaceState.errorWordIndexes = newErrorIndexes;
    newRaceState.errorIndex =
      newErrorIndexes[newErrorIndexes.length - 1]?.charIndex || 0;
    // newRaceState.isCorrect = true;
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
      raceState.prevInput.length - inputVal.length > 1
    ) {

      const newRaceState = {...raceState}
      if (settings.gameInfo.strict) {
        newRaceState.currentCharIndex = raceState.correctWordIndex
        newRaceState.currentWordIndex = raceState.correctWordIndex
        newRaceState.wordsTyped = raceState.lastCorrectWord;
      } else {
        newRaceState.currentCharIndex = raceState.currentWordIndex
        const lastError = raceState.errorWordIndexes[raceState.errorWordIndexes.length - 1];
        if (lastError && lastError.wordIndex === raceState.currentWordIndex) {
          newRaceState.charactersTyped -= lastError.charIndex - raceState.currentWordIndex
          newRaceState.errorIndex = raceState.errorWordIndexes[raceState.errorWordIndexes.length - 2]?.charIndex || 0;
          newRaceState.errorWordIndexes = raceState.errorWordIndexes.slice(0, raceState.errorWordIndexes.length - 1)
        } else {
          newRaceState.charactersTyped -= raceState.currentCharIndex - raceState.currentWordIndex
        }
      }
      newRaceState.isCorrect = true;
      newRaceState.overflowCount = 0;
      inputRef.value = "";
      return newRaceState;
    }
  if (
    // If we have reached the end of the passage and we are correct, end the race
    inputVal === raceState.words[raceState.wordsTyped] &&
    raceState.isCorrect &&
    raceState.currentCharIndex >= raceState.textAreaText.length - 1
  ) {
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
  return { ...raceState };
};

const OnKeyDown = (
  raceState: RaceState,
  settings: GameSettings,
  event: React.KeyboardEvent<HTMLInputElement>,
  currentUser: User | GuestUser
): RaceState => {
  const key = event.key;
  const inputRef = event.target as HTMLInputElement;
  const inputVal = inputRef.value;

  let newRaceState = { ...raceState };

  if (!raceState.isRaceRunning && !raceState.isRaceFinished) {
    if (settings.raceType !== RaceTypes.ONLINE)
      newRaceState = OnStartRace(newRaceState);
  }

  if (raceState.isRaceFinished) return newRaceState;

  if (!settings.gameInfo.strict && key === " ") {
    if (raceState.wordsTyped === raceState.words.length - 1) {
      newRaceState.isCorrect = false;
      newRaceState = AddCharacterDataPoint(raceState, newRaceState, key);
      return OnEndRace(newRaceState, settings, currentUser);
    }

    const isWordCorrect =
      inputVal === raceState.words[raceState.wordsTyped] && raceState.isCorrect;

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
    if (!isWordCorrect) {
      if (!raceState.isCorrect) {
        newRaceState.charactersTyped -=
          raceState.errorIndex - raceState.currentWordIndex;
      } else {
        newRaceState.charactersTyped -=
          raceState.currentCharIndex - raceState.currentWordIndex;
      }
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

    inputRef.value = "";
    event.preventDefault();
    return AddCharacterDataPoint(raceState, newRaceState, key);
  }

  if (key === "Backspace") {
    // We shouldn't be able to go back past the current word we are on unless we aren't in strict mode
    // if (raceState.overflowCount < 1) {
    newRaceState = HandleDeletion(event, newRaceState, settings);
  } else {
    // Keys like alt and ctrl should be ignored for now
    if (
      key.length !== 1 ||
      event.ctrlKey ||
      inputVal.length >= MAX_INPUT_LENGTH
    )
      return newRaceState;

    const selectionLength = document.getSelection()?.toString().length;
    if (selectionLength === 1 || selectionLength === 2) {
      newRaceState.currentCharIndex = raceState.currentWordIndex;
      const lastError =
        raceState.errorWordIndexes[raceState.errorWordIndexes.length - 1];
      if (lastError && lastError.wordIndex === raceState.currentWordIndex) {
        newRaceState.charactersTyped -=
          lastError.charIndex - raceState.currentWordIndex;
        newRaceState.errorIndex =
          raceState.errorWordIndexes[raceState.errorWordIndexes.length - 2]
            ?.charIndex || 0;
        newRaceState.errorWordIndexes = raceState.errorWordIndexes.slice(
          0,
          raceState.errorWordIndexes.length - 1
        );
      } else {
        newRaceState.charactersTyped -=
          raceState.currentCharIndex - raceState.currentWordIndex;
      }

      newRaceState.isCorrect = true;
      inputRef.value = "";

      return AddCharacterDataPoint(raceState, newRaceState, key);
    }

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

  return AddCharacterDataPoint(raceState, newRaceState, key);
};

const IncrementSeconds = (
  raceState: RaceState,
  settings: GameSettings,
  currentUser: User | GuestUser
): RaceState => {
  let newRaceState = { ...raceState };
  newRaceState = UpdateWPM(raceState, settings);
  if (settings.gameInfo.type === GameTypes.TIMED) {
    newRaceState.amount = raceState.amount - 1;
  }
  if (raceState.secondsRunning >= 150) {
    // enqueueSnackbar("Race Timeout : 150 Seconds", {
    //   variant: "error",
    //   anchorOrigin: {
    //     vertical: "top",
    //     horizontal: "right",
    //   },
    // });
    return OnEndRace(newRaceState, settings, currentUser);
  }
  return {
    ...newRaceState,
    secondsRunning: raceState.secondsRunning + 1,
  };
};

const SetAmount = (raceState: RaceState, amount: number): RaceState => {
  return { ...raceState, amount };
};

const AddCharacterDataPoint = (
  raceState: RaceState,
  newRaceState: RaceState,
  key: string
): RaceState => {
  if (!newRaceState.isRaceRunning) return newRaceState;
  const newStatState = {
    ...newRaceState.statState,
    characterTrackingData: [
      ...newRaceState.statState.characterTrackingData,
      {
        charIndex: raceState.currentCharIndex,
        character: key,
        isCorrect: newRaceState.isCorrect,
        timestamp: Date.now(),
      },
    ],
  };

  return { ...newRaceState, statState: newStatState };
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
  event: React.KeyboardEvent<HTMLInputElement>;
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
  retry: boolean;
  settings: GameSettings;
  passage?: string;
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

export type RaceStateReducerActions =
  | OnChangeAction
  | KeydownAction
  | ResetAction
  | AddPassageLengthAction
  | StartRaceAction
  | EndRaceAction
  | IncrementSecondsAction
  | SetAmountAction;

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
      return ResetRace(
        state,
        action.shouldStartRace,
        action.retry,
        action.settings,
        action.passage
      );
    case "addPassageLength":
      return AddPassageLength(state, action.settings);
    case "startRace":
      return OnStartRace(state);
    case "endRace":
      return OnEndRace(state, action.settings, action.currentUser);
    case "incrementSeconds":
      return IncrementSeconds(state, action.settings, action.currentUser);
    case "setAmount":
      return SetAmount(state, action.amount);
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
}: RaceLogicProps) {
  const { currentUser, isLoggedIn } = useAuth();

  const { addGuestRace } = useStats();

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
    raceStateDispatch({
      type: "reset",
      shouldStartRace: false,
      retry: false,
      settings,
      passage,
    });
  }, [settings.gameInfo, settings.textType, passage]);

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

    if (settings.raceType === RaceTypes.ONLINE) {
      socket.emit(
        CLIENT_RACE_UPDATE_EVENT,
        raceState.currentCharIndex,
        raceState.wordsTyped,
        raceState.isCorrect
      );
    }
  }, [raceState.wordsTyped]);

  React.useEffect(() => {
    if (settings.raceType === RaceTypes.ONLINE && testDisabled === false) {
      raceStateDispatch({ type: "startRace" });
    }
  }, [testDisabled]);

  React.useEffect(() => {
    if (raceState.amount <= 0 && raceState.isRaceRunning) {
      console.log("Ending Race On Amounts");
      raceStateDispatch({ type: "endRace", settings, currentUser });
    }
  }, [raceState.amount]);

  React.useEffect(() => {
    if (!raceState.isRaceFinished) return;
    if (settings.raceType === RaceTypes.ONLINE) {
      socket.emit(
        CLIENT_RACE_UPDATE_EVENT,
        raceState.currentCharIndex,
        raceState.wordsTyped,
        raceState.isCorrect
      );
    }

    if (isLoggedIn) {
      try {
        // Send results data to server
        RaceAPI.sendRaceData(currentUser, raceState.statState.resultsData);
      } catch (err) {
        console.error(err);
      }
    } else {
      addGuestRace(raceState.statState.resultsData);
    }
  }, [raceState.isRaceFinished, isLoggedIn]);

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
