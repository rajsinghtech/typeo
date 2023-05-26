import { RaceSchema } from "./schemas/race";
import { CharacterData } from "./race";

import { GameTypeNames, TextTypeNames } from "./settings";
import { CharacterStatsMap, CharacterStats, StatFilters } from "./stats";

export const getCharacterStatsMap = (
  characterDataPoints: CharacterData[],
  passage: string,
  inCharacterStatsMap: CharacterStatsMap | null = null
): CharacterStatsMap => {
  const characterStatsMap: CharacterStatsMap =
    inCharacterStatsMap || new Map<string, CharacterStats>();
  if (!characterDataPoints) return characterStatsMap;

  let prevCorrectIndex = -1;
  const pendingMissedIndicies: Map<number, boolean> = new Map();

  for (const [index, dataPoint] of characterDataPoints.entries()) {
    const passageCharacter = passage[dataPoint.charIndex].toLowerCase();

    if (index === 0) {
      if (dataPoint.isCorrect) {
        prevCorrectIndex = 0;
      }
      continue;
    }

    if (dataPoint.character === "Backspace") {
      // if (dataPoint.isCorrect) {
      //   prevCorrectIndex = index;
      // }
      continue;
    }

    if (dataPoint.isCorrect) {
      if (prevCorrectIndex === -1) continue;
      const timeBetweenKeys =
        dataPoint.timestamp - characterDataPoints[prevCorrectIndex].timestamp;
      const charSpeed = Math.min(300, 0.2 / (timeBetweenKeys / 60000));

      const cStats = characterStatsMap.get(passageCharacter);
      if (cStats) {
        cStats.frequency++;
        cStats.wpm = cStats.wpm + (charSpeed - cStats.wpm) / cStats.frequency;
      } else {
        characterStatsMap.set(passageCharacter, {
          frequency: 1,
          misses: 0,
          wpm: charSpeed,
        });
      }
      if (pendingMissedIndicies.has(dataPoint.charIndex)) {
        pendingMissedIndicies.delete(dataPoint.charIndex);
      }
      prevCorrectIndex = index;
    } else if (
      characterDataPoints[index - 1].isCorrect // Make sure it's not a repeated miss
    ) {
      const cStats = characterStatsMap.get(passageCharacter);
      if (cStats) {
        cStats.misses++;
      } else {
        characterStatsMap.set(passageCharacter, {
          frequency: 0,
          misses: 1,
          wpm: 0,
        });
      }
      pendingMissedIndicies.set(dataPoint.charIndex, true);
    }
  }

  for (const missedIndex of pendingMissedIndicies.keys()) {
    const cStats = characterStatsMap.get(passage[missedIndex].toLowerCase());
    if (cStats) {
      cStats.frequency++;
      cStats.wpm = (cStats.wpm * (cStats.frequency - 1)) / cStats.frequency;
    } else {
      characterStatsMap.set(passage[missedIndex].toLowerCase(), {
        frequency: 1,
        misses: 1,
        wpm: 0,
      });
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
    if (
      dataPoint.character === "Backspace" ||
      characterDataPoints[index - 1].character === "Backspace"
    )
      continue;
    if (!dataPoint.isCorrect && characterDataPoints[index - 1].isCorrect) {
      const sequence = `${characterDataPoints[
        index - 1
      ].character.toLowerCase()}${passage[dataPoint.charIndex].toLowerCase()}`;
      if (sequence in missedSequences) missedSequences[sequence]++;
      else missedSequences[sequence] = 1;
    }
  }

  return missedSequences;
};

export const filterRaces = (
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

export const secondsToHms = (d: number) => {
  return new Date(d * 1000).toISOString().slice(11, 19);
};
