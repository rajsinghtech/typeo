import React from "react";
import { RaceSchema } from "constants/schemas/race";
import { CharacterData, ResultsData } from "constants/race";
import {
  BaseStats,
  CharacterStats,
  CharacterStatsHistory,
  CharacterStatsMap,
  CharacterStatsWithHistory,
  RaceStats,
  SequenceData,
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
import {
  filterRaces,
  getCharacterSequenceData,
  getCharacterStatsMap,
} from "constants/helperFunctions";

interface ContextStats {
  races: RaceSchema[];
  improvementRaces: RaceSchema[];
  addGuestRace: (raceData: ResultsData) => void;
  getBaseStats: (filters: StatFilters) => BaseStats;
  getKeyStatsMap: (filters: StatFilters) => CharacterStatsMap;
  getKeyStatsMapWithHistory: (
    filters: StatFilters
  ) => CharacterStatsWithHistory;
  getMissedSequences: (filters: StatFilters) => SequenceData;
  getImprovementBaseStats: (filters: StatFilters) => BaseStats;
  getImprovementKeyStatsMap: (filters: StatFilters) => CharacterStatsMap;
  getImprovementKeyStatsMapWithHistory: (
    filters: StatFilters
  ) => CharacterStatsWithHistory;
  getImprovementMissedSequences: (filters: StatFilters) => SequenceData;
}

const StatContext = React.createContext<ContextStats>({
  races: [],
  improvementRaces: [],
  addGuestRace: (raceData: ResultsData) => {
    raceData;
  },
  getBaseStats: () => ({
    averages: { wpm: 0, accuracy: 0 },
    best: { wpm: 0, accuracy: 0 },
  }),
  getKeyStatsMap: () => new Map(),
  getKeyStatsMapWithHistory: () => ({ stats: new Map(), history: [] }),
  getMissedSequences: () => ({}),
  getImprovementBaseStats: () => ({
    averages: { wpm: 0, accuracy: 0 },
    best: { wpm: 0, accuracy: 0 },
  }),
  getImprovementKeyStatsMap: () => new Map(),
  getImprovementKeyStatsMapWithHistory: () => ({
    stats: new Map(),
    history: [],
  }),
  getImprovementMissedSequences: () => ({}),
});

export function useStats(): ContextStats {
  return React.useContext(StatContext);
}

export const StatsProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoggedIn } = useAuth();
  const [races, setRaces] = React.useState<RaceSchema[]>([]);
  const [improvementRaces, setImprovementRaces] = React.useState<RaceSchema[]>(
    []
  );

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

  const getBaseStats = (filters: StatFilters, improvement = false) => {
    const averages: RaceStats = {
      wpm: 0,
      accuracy: 0,
    };

    let best: RaceStats = {
      wpm: 0,
      accuracy: 0,
    };

    const statRaces = filterRaces(
      improvement ? improvementRaces : races,
      filters
    );

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

  const getKeyStatsMap = (
    filters: StatFilters,
    improvement = false
  ): CharacterStatsMap => {
    const keySpeedRaces = filterRaces(
      improvement ? improvementRaces : races,
      filters
    );

    const keyStatsMap = new Map();

    for (const race of keySpeedRaces) {
      // Character Speed Calculation
      getCharacterStatsMap(race.characterDataPoints, race.passage, keyStatsMap);
    }
    return keyStatsMap;
  };

  const getKeyStatsMapWithHistory = (
    filters: StatFilters,
    improvement = false
  ): CharacterStatsWithHistory => {
    const keySpeedRaces = filterRaces(
      improvement ? improvementRaces : races,
      filters
    );

    const keyStatsMap = new Map();
    const history: CharacterStatsHistory[] = [];

    for (const race of keySpeedRaces) {
      // Character Speed Calculation
      getCharacterStatsMap(race.characterDataPoints, race.passage, keyStatsMap);
      // const individualRaceStats = getCharacterStatsMap(
      //   race.characterDataPoints,
      //   race.passage
      // );
      const keyStatsCopy = new Map<string, CharacterStats>(
        JSON.parse(JSON.stringify(Array.from(keyStatsMap)))
      );
      history.push({
        stats: keyStatsCopy,
        timestamp: race.timestamp,
      });
    }
    return { stats: keyStatsMap, history };
  };

  const getMissedSequences = (filters: StatFilters, improvement = false) => {
    const missedSequenceRaces = filterRaces(
      improvement ? improvementRaces : races,
      filters
    );

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
    const qi = query(
      collection(db, "users", currentUser.uid, "improvement_races"),
      limit(Timeframes.LAST_100),
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

    onSnapshot(qi, { includeMetadataChanges: true }, (snapshot) => {
      if (!isMounted || snapshot.docChanges().length <= 0) return;
      setImprovementRaces((prevRaces) => {
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
    improvementRaces,
    addGuestRace,
    getBaseStats,
    getKeyStatsMap,
    getKeyStatsMapWithHistory,
    getMissedSequences,
    getImprovementBaseStats: (filters: StatFilters) =>
      getBaseStats(filters, true),
    getImprovementKeyStatsMap: (filters: StatFilters) =>
      getKeyStatsMap(filters, true),
    getImprovementKeyStatsMapWithHistory: (filters: StatFilters) =>
      getKeyStatsMapWithHistory(filters, true),
    getImprovementMissedSequences: (filters: StatFilters) =>
      getMissedSequences(filters, true),
  };

  return <StatContext.Provider value={value}>{children}</StatContext.Provider>;
};
