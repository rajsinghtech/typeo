import React from "react";
import { getPlayerStats } from "../api/rest/stats";
import { RaceSchema } from "../constants/schemas/race";
import { CharacterData } from "../constants/race";
import { RaceStats, Timeframes } from "../constants/stats";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import {
  query,
  collection,
  onSnapshot,
  where,
  Timestamp,
  limit,
  orderBy,
} from "firebase/firestore";

interface ContextStats {
  races: RaceSchema[];
  getBaseStats: (timeframe: number) => { averages: RaceStats; best: RaceStats };
  getKeySpeeds: (timeframe: number) => number[];
  getMissedSequences: (timeframe: number) => { [x: string]: number };
}

const StatContext = React.createContext<ContextStats>({
  races: [],
  getBaseStats: (timeframe: number) => ({
    averages: { wpm: 0, accuracy: 0 },
    best: { wpm: 0, accuracy: 0 },
  }),
  getKeySpeeds: (timeframe: number) => [],
  getMissedSequences: (timeframe: number) => ({}),
});

export function useStats(): ContextStats {
  return React.useContext(StatContext);
}

export const StatsProvider = ({ children }: { children: any }) => {
  const { currentUser, isLoggedIn } = useAuth();
  const [races, setRaces] = React.useState<RaceSchema[]>([]);

  const getBaseStats = (timeframe: number) => {
    const averages: RaceStats = {
      wpm: 0,
      accuracy: 0,
      mostMissedCharacter: "None",
    };

    let best: RaceStats = {
      wpm: 0,
      accuracy: 0,
    };

    const statRaces = races.slice(-timeframe);

    const mostMissedCharacterMap = new Map<string, number>();
    let maxMissedCharacterCount = 0;

    for (const race of statRaces) {
      if (race.wpm > best.wpm) {
        const { wpm, accuracy } = race;
        best = { wpm, accuracy };
      }

      averages.wpm += race.wpm;
      averages.accuracy += race.accuracy;

      // Most Missed Character Calculation
      const missedCharacter = getMosedMissedCharacter(
        race.characterDataPoints,
        race.passage
      );
      if (missedCharacter !== "None") {
        const newCharacterCount =
          (mostMissedCharacterMap.get(missedCharacter) || 0) + 1;
        mostMissedCharacterMap.set(missedCharacter, newCharacterCount);

        if (newCharacterCount > maxMissedCharacterCount) {
          averages.mostMissedCharacter = missedCharacter;
          maxMissedCharacterCount = newCharacterCount;
        }
      }
    }

    averages.wpm /= statRaces.length || 1;
    averages.accuracy /= statRaces.length | 1;

    if (averages.mostMissedCharacter === " ")
      averages.mostMissedCharacter = "Space";

    return { averages, best };
  };

  const getKeySpeeds = (timeframe: number) => {
    const keySpeedRaces = races.slice(-timeframe);
    const averageCharacterSpeeds = new Array(26).fill(0);
    const averageCharacterSpeedCount = new Array(26).fill(0);

    for (const race of keySpeedRaces) {
      // Character Speed Calculation
      const characterSpeed = getCharacterSpeed(race.characterDataPoints);
      if (characterSpeed) {
        for (const [index, keySpeed] of characterSpeed.entries()) {
          if (keySpeed !== 0) {
            averageCharacterSpeeds[index] += keySpeed;
            averageCharacterSpeedCount[index]++;
          }
        }
      }
    }
    return averageCharacterSpeeds.map(
      (speed, index) => speed / (averageCharacterSpeedCount[index] || 1)
    );
  };

  const getMissedSequences = (timeframe: number) => {
    const missedSequenceRaces = races.slice(-timeframe);

    const missedTwoLetterSequences = {};

    for (const race of missedSequenceRaces) {
      // Missed Sequences
      getMissedCharacterSequences(
        missedTwoLetterSequences,
        race.characterDataPoints,
        race.passage
      );
    }

    return missedTwoLetterSequences;
  };

  React.useEffect(() => {
    let isMounted = true;
    if (!isLoggedIn) return;
    const q = query(
      collection(db, "users", currentUser.uid, "races"),
      limit(Timeframes.ALL_TIME),
      orderBy("timestamp", "desc")
    );
    onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      if (!isMounted || snapshot.docChanges().length <= 0) return;
      setRaces((prevRaces) => {
        const prevRacesCopy = [...prevRaces];
        snapshot
          .docChanges()
          .reverse()
          .forEach((change) => {
            const type = change.type;
            if (type === "added") {
              prevRacesCopy.push(change.doc.data() as RaceSchema);
            }
          });
        return prevRacesCopy;
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = {
    races,
    getBaseStats,
    getKeySpeeds,
    getMissedSequences,
  };

  return <StatContext.Provider value={value}>{children}</StatContext.Provider>;
};

export const getMosedMissedCharacter = (
  characterDataPoints: CharacterData[],
  passage: string
) => {
  let mostMissedCharacter = "None";
  if (!characterDataPoints) return mostMissedCharacter;

  const characterMap = new Map<string, number>();
  let maxCount = 0;
  let compoundError = false;
  for (const element of characterDataPoints) {
    if (!element.isCorrect && !compoundError) {
      const character = passage[element.charIndex - 1];
      const newCharacterCount = (characterMap.get(character) || 0) + 1;
      characterMap.set(character, newCharacterCount);

      if (newCharacterCount > maxCount) {
        mostMissedCharacter = character;
        maxCount = newCharacterCount;
      }
    } else if (element.isCorrect && compoundError) {
      compoundError = false;
    }
  }

  return mostMissedCharacter;
};

export const getCharacterSpeed = (characterDataPoints: CharacterData[]) => {
  const characterSpeeds = new Array(26).fill(0);
  if (!characterDataPoints) return characterSpeeds;

  const characterCount = new Array(26).fill(0);
  for (const [index, dataPoint] of characterDataPoints.entries()) {
    if (
      index === 0 ||
      !/^[a-z]$/.test(dataPoint.character) ||
      !dataPoint.isCorrect
    )
      continue;
    let prevCorrect = -1;
    for (let i = index - 1; i >= 0; i--) {
      if (characterDataPoints[i].isCorrect) {
        prevCorrect = i;
        break;
      }
    }
    if (prevCorrect === -1) continue;
    const timeBetweenKeys =
      dataPoint.timestamp - characterDataPoints[prevCorrect].timestamp;
    const charSpeed = 0.2 / (timeBetweenKeys / 60000);
    const charIndex = dataPoint.character.charCodeAt(0) - 97;
    characterCount[charIndex]++;
    characterSpeeds[charIndex] =
      characterSpeeds[charIndex] +
      (charSpeed - characterSpeeds[charIndex]) / characterCount[charIndex];
  }
  return characterSpeeds;
};

export const getMissedCharacterSequences = (
  missedSequences: { [x: string]: number },
  characterDataPoints: CharacterData[],
  passage: string
) => {
  if (!characterDataPoints) return missedSequences;
  for (const [index, dataPoint] of characterDataPoints.entries()) {
    if (index === 0) continue;
    if (!dataPoint.isCorrect && characterDataPoints[index - 1].isCorrect) {
      const sequence = `${characterDataPoints[index - 1].character}${
        passage[dataPoint.charIndex]
      }`;
      if (sequence in missedSequences) missedSequences[sequence]++;
      else missedSequences[sequence] = 1;
    }
  }

  return missedSequences;
};
