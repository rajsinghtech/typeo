import { Timestamp } from "firebase/firestore";
import { GameTypeNames, GameTypes, TextTypeNames, TextTypes } from "./settings";

export interface StatsStructure {
  averages: RaceStats;
  best: RaceStats;
}

export interface RaceStats {
  wpm: number;
  accuracy: number;
}

export interface CharacterStats {
  wpm: number;
  frequency: number;
  misses: number;
}

export interface BaseStats {
  averages: RaceStats;
  best: RaceStats;
}

export type CharacterStatsMap = Map<string, CharacterStats>;

export interface CharacterStatsHistory {
  stats: CharacterStatsMap;
  timestamp: Timestamp;
}

export interface CharacterStatsWithHistory {
  stats: CharacterStatsMap;
  history: CharacterStatsHistory[];
}

export interface SequenceData {
  [x: string]: number;
}

export enum Timeframes {
  ALL_TIME = 1000,
  LAST_100 = 100,
  LAST_50 = 50,
  LAST_25 = 25,
  LAST_10 = 10,
}

export interface StatFilters {
  timeframe: number;
  gameMode: number[];
  textType: number[];
}

export const DefaultStatFilters = {
  timeframe: Timeframes.LAST_25,
  gameMode: GameTypeNames.slice(0, GameTypeNames.length - 1).map((_, i) => i),
  textType: TextTypeNames.map((_, i) => i),
};

export const DefaultImprovementStatFilters = {
  timeframe: Timeframes.LAST_25,
  gameMode: [GameTypes.WORDS],
  textType: [TextTypes.TOP_WORDS],
};
