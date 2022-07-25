import React from "react";
import { RaceSchema } from "constants/schemas/race";
import { CharacterData } from "constants/race";
import { RaceStats, StatFilters, Timeframes } from "constants/stats";
import { useAuth } from "contexts/AuthContext";
import { db } from "config/firebase";
import {
  query,
  collection,
  onSnapshot,
  limit,
  orderBy,
} from "firebase/firestore";
import { GameTypeNames, TextTypeNames } from "constants/settings";

interface ContextStats {
  races: RaceSchema[];
  getBaseStats: (filters: StatFilters) => {
    averages: RaceStats;
    best: RaceStats;
  };
  getKeySpeeds: (filters: StatFilters) => number[];
  getMissedSequences: (filters: StatFilters) => { [x: string]: number };
}

const StatContext = React.createContext<ContextStats>({
  races: [],
  getBaseStats: () => ({
    averages: { wpm: 0, accuracy: 0 },
    best: { wpm: 0, accuracy: 0 },
  }),
  getKeySpeeds: () => [],
  getMissedSequences: () => ({}),
});

export function useStats(): ContextStats {
  return React.useContext(StatContext);
}

export const StatsProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoggedIn } = useAuth();
  const [races, setRaces] = React.useState<RaceSchema[]>([]);

  const getBaseStats = (filters: StatFilters) => {
    const averages: RaceStats = {
      wpm: 0,
      accuracy: 0,
    };

    let best: RaceStats = {
      wpm: 0,
      accuracy: 0,
    };

    const statRaces = filterRaces(races, filters);

    for (const race of statRaces) {
      if (race.wpm > best.wpm) {
        const { wpm, accuracy } = race;
        best = { wpm, accuracy };
      }

      averages.wpm += race.wpm;
      averages.accuracy += race.accuracy;
    }

    averages.wpm /= statRaces.length || 1;
    averages.accuracy /= statRaces.length | 1;

    return { averages, best };
  };

  const getKeySpeeds = (filters: StatFilters) => {
    const keySpeedRaces = filterRaces(races, filters);

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

  const getMissedSequences = (filters: StatFilters) => {
    const missedSequenceRaces = filterRaces(races, filters);

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

const filterRaces = (
  races: RaceSchema[],
  filters: StatFilters
): RaceSchema[] => {
  const filteredRaces = races.slice(-filters.timeframe).filter((race) => {
    return (
      race.wpm > 3 &&
      filters.gameMode.includes(GameTypeNames.indexOf(race.testType.name)) &&
      filters.textType.includes(TextTypeNames.indexOf(race.testType.textType))
    );
  });

  return filteredRaces;
};
