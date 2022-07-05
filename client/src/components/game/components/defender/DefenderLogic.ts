import React from "react";
import { getPassage } from "../../../../constants/passages";
import { TextTypes } from "../../../../constants/settings";
import { RaceStateSubset } from "../../RaceLogic";
import { v4 as uuidv4 } from "uuid";

const PARTICLE_COLORS = [
  "rgba(255, 0, 0, 0.5)",
  "rgba(0, 255, 0, 0.5)",
  "rgba(0, 0, 255, 0.5)",
];

const InitialDefenderState: DefenderState = {
  level: 1,
  score: 0,
  health: 100,
  multiplier: 1,
  raceState: { currentCharIndex: 0, currentWordIndex: 0, wordsTyped: 0 },
  currentEnemyUID: "",
  enemies: [],
  shipRotation: 0,
  bullets: [],
  explosions: [],
};

interface DefenderState {
  level: number;
  score: number;
  health: number;
  multiplier: number;
  raceState: RaceStateSubset;
  currentEnemyUID: string;
  enemies: EnemyType[];
  shipRotation: number;
  bullets: { offsetLeft: number; uid: string }[];
  explosions: ExplosionType[];
}

export interface EnemyType {
  type: EnemyVariant;
  charactersTyped: number;
  text: string;
  uid: string;
  delay: number;
}

export interface EnemyVariant {
  shape: "square" | "circle";
  color: string;
  numWords: number;
}

const EnemyTypes: EnemyVariant[] = [
  { shape: "square", color: "lawngreen", numWords: 2 },
  { shape: "square", color: "cyan", numWords: 4 },
  { shape: "square", color: "purple", numWords: 6 },
  { shape: "circle", color: "green", numWords: 10 },
  { shape: "circle", color: "cyan", numWords: 12 },
  { shape: "circle", color: "purple", numWords: 14 },
];

export interface ParticleType {
  x: number;
  y: number;
  color: string;
}

interface ExplosionType {
  offsetLeft: number;
  uid: string;
  particleData: ParticleType[];
}

const createEnemyData = (type: EnemyVariant, delay: number): EnemyType => {
  const text = getPassage(TextTypes.TOP_WORDS, type.numWords);

  return {
    type,
    charactersTyped: 0,
    uid: uuidv4(),
    text,
    delay,
  };
};

const SpawnEnemies = (defenderState: DefenderState): DefenderState => {
  const firstEnemyData = createEnemyData(EnemyTypes[0], 0);
  const newEnemies = [firstEnemyData];

  for (let i = 1; i < 5; i++) {
    const enemyData = createEnemyData(EnemyTypes[1], i);
    newEnemies.push(enemyData);
  }

  return {
    ...defenderState,
    currentEnemyUID: firstEnemyData.uid,
    enemies: newEnemies,
  };
};

const createExplosionData = (
  offsetLeft: number,
  big = false
): ExplosionType => {
  const particleOffsetMultiplier = big ? 500 : 200;
  return {
    offsetLeft: offsetLeft,
    uid: uuidv4(),
    particleData: Array.from({ length: big ? 10 : 1 }, () => ({
      x:
        Math.random() * particleOffsetMultiplier - particleOffsetMultiplier / 2,
      y:
        Math.random() * particleOffsetMultiplier - particleOffsetMultiplier / 2,
      color:
        PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    })),
  };
};

const SpawnExplosion = (
  defenderState: DefenderState,
  offsetLeft: number,
  big = false
): DefenderState => {
  if (offsetLeft === 0) return defenderState;

  const newExplosions = [
    ...defenderState.explosions,
    createExplosionData(offsetLeft, big),
  ];
  return { ...defenderState, explosions: newExplosions };
};

const SpawnBullet = (
  defenderState: DefenderState,
  offsetLeft: number
): DefenderState => {
  const newDefenderState = { ...defenderState };
  const newBullets = [...defenderState.bullets, { offsetLeft, uid: uuidv4() }];
  newDefenderState.bullets = newBullets;
  return newDefenderState;
};

const OnBulletHit = (
  defenderState: DefenderState,
  bulletUID: string,
  enemyBoxRef: React.RefObject<HTMLDivElement>
): DefenderState => {
  let newDefenderState = { ...defenderState };
  if (newDefenderState.enemies[0]) {
    let newEnemies = [...newDefenderState.enemies];
    newEnemies[0].charactersTyped++;

    if (
      newDefenderState.enemies[0].charactersTyped >=
      newDefenderState.enemies[0].text.length
    ) {
      newDefenderState = SpawnExplosion(
        defenderState,
        getEnemyOffsetLeft(0, enemyBoxRef),
        true
      );
      newEnemies = defenderState.enemies.slice(1);
    }
    newDefenderState.enemies = newEnemies;
  }
  const bulletIndex = newDefenderState.bullets.findIndex(
    (bullet) => bullet.uid === bulletUID
  );
  const newBullets = [...defenderState.bullets];
  newBullets.splice(bulletIndex, 1);
  newDefenderState.bullets = newBullets;
  return newDefenderState;
};

const Shoot = (
  defenderState: DefenderState,
  offsetLeft: number,
  enemyBoxWidth: number
): DefenderState => {
  let newDefenderState = { ...defenderState };

  const currentEnemyIndex = defenderState.enemies.findIndex(
    (enemy) => enemy.uid === defenderState.currentEnemyUID
  );

  if (defenderState.enemies[0]) {
    const prevEnemiesCopy = [...defenderState.enemies];

    if (
      defenderState.raceState.currentCharIndex >=
      defenderState.enemies[currentEnemyIndex].text.length
    ) {
      newDefenderState.currentEnemyUID =
        defenderState.enemies[currentEnemyIndex + 1]?.uid || "";
      newDefenderState.raceState = InitialDefenderState.raceState;
    }
  }

  newDefenderState.shipRotation = (offsetLeft / enemyBoxWidth - 0.5) * 115;
  newDefenderState = SpawnBullet(newDefenderState, offsetLeft);

  return newDefenderState;
};

const DealDamage = (
  defenderState: DefenderState,
  damage: number
): DefenderState => {
  const newHealth = defenderState.health - damage;
  const newEnemies = defenderState.enemies.slice(1);
  const newCurrentEnemyUID = newEnemies[0]?.uid || "";
  return {
    ...defenderState,
    enemies: newEnemies,
    health: newHealth,
    currentEnemyUID: newCurrentEnemyUID,
    raceState: { ...InitialDefenderState.raceState },
  };
};

const getEnemyOffsetLeft = (
  index: number,
  enemyBoxRef: React.RefObject<HTMLDivElement>
): number => {
  if (!enemyBoxRef.current) return 0;

  const currentEnemy = enemyBoxRef.current.children[index] as HTMLElement;

  return (
    currentEnemy.getBoundingClientRect().left -
    enemyBoxRef.current?.getBoundingClientRect().left
  );
};

const KeyDown = (
  defenderState: DefenderState,
  event: React.KeyboardEvent<HTMLInputElement>,
  enemyBoxRef: React.RefObject<HTMLDivElement>
): DefenderState => {
  let newDefenderState = { ...defenderState };
  const key = event.key;
  const currentEnemyIndex = defenderState.enemies.findIndex(
    (enemy) => enemy.uid === defenderState.currentEnemyUID
  );
  const currentEnemy = defenderState.enemies[currentEnemyIndex];
  if (currentEnemy) {
    if (
      key === currentEnemy.text[newDefenderState.raceState.currentCharIndex]
    ) {
      const newRaceState = { ...newDefenderState.raceState };
      newRaceState.currentCharIndex++;
      if (key === " ") {
        newRaceState.wordsTyped++;
        newRaceState.currentWordIndex = newRaceState.currentCharIndex;
      }
      newDefenderState.raceState = newRaceState;
      newDefenderState.score += 5 * defenderState.multiplier;
      newDefenderState.multiplier += 0.05;

      const currentEnemyIndex = defenderState.enemies.findIndex(
        (enemy) => enemy.uid === defenderState.currentEnemyUID
      );

      const currentEnemyOffsetLeft = getEnemyOffsetLeft(
        currentEnemyIndex,
        enemyBoxRef
      );

      newDefenderState = Shoot(
        newDefenderState,
        currentEnemyOffsetLeft,
        enemyBoxRef.current?.offsetWidth || 0
      );
    } else if (key.length === 1) {
      newDefenderState.multiplier = 1;
    }
  }
  event.preventDefault();

  return newDefenderState;
};

interface KeyDownAction {
  type: "keydown";
  event: React.KeyboardEvent<HTMLInputElement>;
  enemyBoxRef: React.RefObject<HTMLDivElement>;
}

interface SpawnEnemiesAction {
  type: "spawnEnemies";
}

interface BulletHitAction {
  type: "bulletHit";
  bulletUID: string;
  enemyBoxRef: React.RefObject<HTMLDivElement>;
}

interface DealDamageAction {
  type: "dealDamage";
  damage: number;
}

export type DefenderStateReducerActions =
  | KeyDownAction
  | SpawnEnemiesAction
  | BulletHitAction
  | DealDamageAction;

const DefenderStateReducer = (
  state: DefenderState,
  action: DefenderStateReducerActions
): DefenderState => {
  switch (action.type) {
    case "keydown":
      return KeyDown(state, action.event, action.enemyBoxRef);
    case "spawnEnemies":
      return SpawnEnemies(state);
    case "bulletHit":
      return OnBulletHit(state, action.bulletUID, action.enemyBoxRef);
    case "dealDamage":
      return DealDamage(state, action.damage);
    default:
      throw new Error();
  }
};

export const useDefenderLogic = () => {
  const [defenderState, defenderStateDispatch] = React.useReducer(
    DefenderStateReducer,
    InitialDefenderState
  );

  return {
    defenderState,
    defenderStateDispatch,
  };
};
