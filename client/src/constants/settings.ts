export interface GameSettings {
  textType: TextTypes;
  gameInfo: {
    type: GameTypes;
    amount?: number;
    practice: {
      isPractice: boolean;
      practiceStrings: string[];
    };
    strict?: boolean;
  };
  defender: {
    difficulty: Difficulty;
  };
  display: {
    smoothFollower: boolean;
    followerStyle: FollowerTypes;
    followerSpeed: number;
    showWPM: boolean;
    showProfile: boolean;
  };
  online: boolean;
}

export type Difficulty = "easy" | "medium" | "hard" | "impossible";

export enum FollowerTypes {
  DEFAULT,
  LEFT,
  BOTTOM,
}

export enum GameTypes {
  TIMED,
  WORDS,
  ERRORS,
  DEFENDER,
}

export const GameTypeNames = ["Timed", "Words", "Errors", "Defender"];
export const GameTypeAmounts = [
  [5, 15, 30, 60, 120],
  [5, 10, 20, 50, 100],
  [1, 2, 3, 4, 5],
  [],
];

export enum TextTypes {
  PASSAGE,
  TOP_WORDS,
  NUMBERS,
}

export const TextTypeNames = ["Passage", "Top Words", "Numbers"];

export const DefaultGameSettings: GameSettings = {
  textType: TextTypes.PASSAGE,
  gameInfo: {
    type: GameTypes.TIMED,
    amount: 30,
    practice: { isPractice: false, practiceStrings: [] },
    strict: false,
  },
  defender: {
    difficulty: "easy",
  },
  display: {
    smoothFollower: true,
    followerSpeed: 0.1,
    followerStyle: FollowerTypes.DEFAULT,
    showWPM: true,
    showProfile: true,
  },
  online: false,
};

export const DefaultOnlineGameSettings: GameSettings = {
  textType: TextTypes.PASSAGE,
  gameInfo: {
    type: GameTypes.WORDS,
    amount: 50,
    practice: { isPractice: false, practiceStrings: [] },
    strict: true,
  },
  defender: {
    difficulty: "easy",
  },
  display: {
    smoothFollower: true,
    followerSpeed: 0.1,
    followerStyle: FollowerTypes.DEFAULT,
    showWPM: true,
    showProfile: true,
  },
  online: true,
};

export enum MatchStatus {
  WAITING_FOR_PLAYERS = "Waiting For Players",
  STARTING = "Starting",
  STARTED = "Started",
  FINISHED = "Finished",
}
