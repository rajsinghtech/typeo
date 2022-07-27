import { GameTypeNames, TextTypeNames } from "./settings";

export interface StatsStructure {
  averages: RaceStats;
  best: RaceStats;
}

export interface RaceStats {
  wpm: number;
  accuracy: number;
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
  timeframe: Timeframes.LAST_100,
  gameMode: GameTypeNames.slice(0, GameTypeNames.length - 1).map((_, i) => i),
  textType: TextTypeNames.map((_, i) => i),
};
