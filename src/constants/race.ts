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
  testType: { name: string; amount?: number; textType: string };
  characterDataPoints: CharacterData[];
}
