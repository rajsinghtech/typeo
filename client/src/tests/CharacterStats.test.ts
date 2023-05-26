import { getCharacterStatsMap } from "constants/helperFunctions";

const testPassage = "This is a test passage";
const baseTimestamp = 1671893056278;
const timeToTypeCharacter = 100;

const calculateWPM = (time: number, characters: number) => {
  return (characters / 5 / time) * 60000;
};

const compareWPM = (wpm1: number | undefined, wpm2: number | undefined) => {
  if (!wpm1 || !wpm2) return true;
  return Math.abs(wpm1 - wpm2) < 0.0001;
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
  expect(
    compareWPM(stats.get("h")?.wpm, calculateWPM(timeToTypeCharacter, 1))
  ).toBe(true);
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
  expect(compareWPM(stats.get("h")?.wpm, 0)).toBe(true);
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

test("Correct to Correct", () => {
  const characterDataPoints = ["T", "h", "i"].map((character, index) => ({
    charIndex: index,
    character,
    timestamp: baseTimestamp + index * timeToTypeCharacter,
    isCorrect: true,
  }));
  const stats = getCharacterStatsMap(characterDataPoints, testPassage);
  expect(stats.get("i")).toBeTruthy();
  expect(stats.get("i")?.frequency).toBe(1);
  expect(stats.get("i")?.misses).toBe(0);
  console.log(stats.get("i")?.wpm, calculateWPM(timeToTypeCharacter * 2, 2));
  expect(
    compareWPM(stats.get("i")?.wpm, calculateWPM(timeToTypeCharacter * 2, 2))
  ).toBe(true);
  expect([...stats.entries()].length).toBe(2);
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
  expect(
    compareWPM(stats.get("h")?.wpm, calculateWPM(timeToTypeCharacter * 3, 1))
  ).toBe(true);
  expect([...stats.entries()].length).toBe(1);
});

export {};
