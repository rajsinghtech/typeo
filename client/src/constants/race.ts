import { RaceTypes } from "./settings";

export interface CharacterData {
  charIndex: number;
  character: string;
  isCorrect: boolean;
  timestamp: number;
  multiCharacterDelete?: number;
}

export interface WPMData {
  wpm: number;
  timestamp: number;
}

export interface ResultsData {
  passage: string;
  startTime: number;
  dataPoints: WPMData[];
  accuracy: number;
  characters: { correct: number; incorrect: number; total: number };
  testType: {
    name: string;
    textType: string;
    amount?: number;
  };
  characterDataPoints: CharacterData[];
  raceType: RaceTypes;
  improvementCategory?: string;
}

export const MAX_INPUT_LENGTH = 15;
