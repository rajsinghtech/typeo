import React from "react";
import { RaceSchema } from "constants/schemas/race";
import { CharacterData, ResultsData } from "constants/race";
import {
  CharacterStats,
  CharacterStatsMap,
  RaceStats,
  StatFilters,
  Timeframes,
} from "constants/stats";
import { useAuth } from "contexts/AuthContext";
import { db } from "config/firebase";
import {
  query,
  collection,
  onSnapshot,
  limit,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { GameTypeNames, TextTypeNames } from "constants/settings";

interface ContextStats {
  races: RaceSchema[];
  addGuestRace: (raceData: ResultsData) => void;
  getBaseStats: (filters: StatFilters) => {
    averages: RaceStats;
    best: RaceStats;
  };
  getKeyStatsMap: (filters: StatFilters) => CharacterStatsMap;
  getMissedSequences: (filters: StatFilters) => { [x: string]: number };
}

const StatContext = React.createContext<ContextStats>({
  races: [],
  addGuestRace: (raceData: ResultsData) => null,
  getBaseStats: () => ({
    averages: { wpm: 0, accuracy: 0 },
    best: { wpm: 0, accuracy: 0 },
  }),
  getKeyStatsMap: () => new Map(),
  getMissedSequences: () => ({}),
});

export function useStats(): ContextStats {
  return React.useContext(StatContext);
}

export const StatsProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoggedIn } = useAuth();
  const [races, setRaces] = React.useState<RaceSchema[]>([]);

  const addGuestRace = (raceData: ResultsData) => {
    const characterDataPoints: Array<CharacterData> =
      raceData.characterDataPoints;
    const wpm = raceData.dataPoints[raceData.dataPoints.length - 1].wpm;
    const accuracy = raceData.accuracy;
    const testType = raceData.testType;
    const passage = raceData.passage;
    const timestamp = Timestamp.fromMillis(raceData.startTime);

    setRaces((prevRaces) => {
      return [
        ...prevRaces,
        { characterDataPoints, wpm, accuracy, testType, passage, timestamp },
      ];
    });
  };

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

  const getKeyStatsMap = (filters: StatFilters): CharacterStatsMap => {
    const keySpeedRaces = filterRaces(races, filters);

    const keyStatsMap = new Map();

    for (const race of keySpeedRaces) {
      // Character Speed Calculation
      getCharacterStatsMap(race.characterDataPoints, race.passage, keyStatsMap);
    }

    return keyStatsMap;
  };

  const getMissedSequences = (filters: StatFilters) => {
    const missedSequenceRaces = filterRaces(races, filters);

    const missedTwoLetterSequences = {};

    for (const race of missedSequenceRaces) {
      // Missed Sequences
      getCharacterSequenceData(
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
    addGuestRace,
    getBaseStats,
    getKeyStatsMap,
    getMissedSequences,
  };

  return <StatContext.Provider value={value}>{children}</StatContext.Provider>;
};

export const getCharacterStatsMap = (
  characterDataPoints: CharacterData[],
  passage: string,
  inCharacterStatsMap: CharacterStatsMap | null = null
): CharacterStatsMap => {
  const characterStatsMap: CharacterStatsMap =
    inCharacterStatsMap || new Map<string, CharacterStats>();
  if (!characterDataPoints) return characterStatsMap;

  for (const [index, dataPoint] of characterDataPoints.entries()) {
    const passageCharacter = passage[dataPoint.charIndex].toLowerCase();

    if (index === 0) {
      if (characterStatsMap.has(passageCharacter))
        characterStatsMap.get(passageCharacter)!.frequency++;
      else
        characterStatsMap.set(passageCharacter, {
          wpm: 0,
          frequency: 1,
          misses: 0,
        });
      if (!dataPoint.isCorrect) {
        characterStatsMap.get(passageCharacter)!.misses++;
      }
      continue;
    }

    if (dataPoint.charIndex !== characterDataPoints[index - 1].charIndex) {
      if (characterStatsMap.has(passageCharacter))
        characterStatsMap.get(passageCharacter)!.frequency++;
      else
        characterStatsMap.set(passageCharacter, {
          wpm: 0,
          frequency: 1,
          misses: 0,
        });
    }

    if (dataPoint.isCorrect) {
      let prevPassageIndex = -1;
      for (let i = index - 1; i >= 0; i--) {
        if (characterDataPoints[i].charIndex !== dataPoint.charIndex) {
          prevPassageIndex = i;
          break;
        }
      }

      if (prevPassageIndex === -1) continue;
      const timeBetweenKeys =
        dataPoint.timestamp - characterDataPoints[prevPassageIndex].timestamp;
      const charSpeed = Math.min(300, 0.2 / (timeBetweenKeys / 60000));
      characterStatsMap.get(passageCharacter)!.wpm =
        characterStatsMap.get(passageCharacter)!.wpm +
        (charSpeed - characterStatsMap.get(passageCharacter)!.wpm) /
          characterStatsMap.get(passageCharacter)!.frequency;
    } else if (
      dataPoint.charIndex !== characterDataPoints[index - 1].charIndex // Make sure it's not a repeated miss
    ) {
      characterStatsMap.get(passageCharacter)!.misses++;
    }
  }

  return characterStatsMap;
};

export const getCharacterSequenceData = (
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
