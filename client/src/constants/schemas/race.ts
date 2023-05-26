import { Timestamp } from "firebase/firestore";
import { CharacterData } from "constants/race";

export interface RaceSchema {
  passage: string;
  wpm: number;
  accuracy: number;
  characterDataPoints: CharacterData[];
  testType: { name: string; amount?: number; textType: string };
  improvementCategory?: string;
  timestamp: Timestamp;
}
