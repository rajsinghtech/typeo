import { getCharacterStatsMap } from "constants/helperFunctions";

const testPassage = "This is a test passage";
const baseTimestamp = 1671893056278;
const timeToTypeCharacter = 100;

const calculateWPM = (time: number, characters: number) => {
  return (characters / 5 / time) * 60000;
};

test("First Character Correct to Correct", () => {
  const characterDataPoints = ["T", "h"].map((character, index) => ({
    charIndex: index,
    character,
    timestamp: baseTimestamp + index * timeToTypeCharacter,
    isCorrect: true,
  }));
  const stats = getCharacterStatsMap(characterDataPoints, testPassage);
  expect(stats.get("h")).toBeTruthy();
  expect(stats.get("h")?.frequency).toBe(1);
  expect(stats.get("h")?.misses).toBe(0);
  expect(stats.get("h")?.wpm).toBe(calculateWPM(timeToTypeCharacter, 1));
  expect([...stats.entries()].length).toBe(1);
});

test("First Character Correct to Incorrect", () => {
  const characterDataPoints = ["T", "e"].map((character, index) => ({
    charIndex: index,
    character,
    timestamp: baseTimestamp + index * timeToTypeCharacter,
    isCorrect: index !== 1,
  }));
  const stats = getCharacterStatsMap(characterDataPoints, testPassage);
  expect(stats.get("h")).toBeTruthy();
  expect(stats.get("h")?.frequency).toBe(1);
  expect(stats.get("h")?.misses).toBe(1);
  expect(stats.get("h")?.wpm).toBe(0);
  expect([...stats.entries()].length).toBe(1);
});

test("First Character Incorrect to Correct", () => {
  const characterDataPoints = ["h", "Backspace", "T"].map(
    (character, index) => ({
      charIndex: 0,
      character,
      timestamp: baseTimestamp + index * timeToTypeCharacter,
      isCorrect: index === 3,
    })
  );
  const stats = getCharacterStatsMap(characterDataPoints, testPassage);
  console.log(stats);
  expect([...stats.entries()].length).toBe(0);
});

test("First Character Incorrect to Incorrect", () => {
  const characterDataPoints = ["h", "e"].map((character, index) => ({
    charIndex: 0,
    character,
    timestamp: baseTimestamp + index * timeToTypeCharacter,
    isCorrect: false,
  }));
  const stats = getCharacterStatsMap(characterDataPoints, testPassage);
  expect([...stats.entries()].length).toBe(0);
});

test("Incorrect To Correct", () => {
  const characterDataPoints = ["T", "e", "Backspace", "h"].map(
    (character, index) => ({
      charIndex: index === 3 ? 1 : index,
      character,
      timestamp: baseTimestamp + index * timeToTypeCharacter,
      isCorrect: index !== 1,
    })
  );
  const stats = getCharacterStatsMap(characterDataPoints, testPassage);
  expect(stats.get("h")).toBeTruthy();
  // expect(stats.get("h")?.frequency).toBe(1);
  expect(stats.get("h")?.misses).toBe(1);
  expect(stats.get("h")?.wpm).toBe(calculateWPM(timeToTypeCharacter * 3, 1));
  expect([...stats.entries()].length).toBe(1);
});

export {};
