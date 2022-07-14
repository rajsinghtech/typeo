import React from "react";
import { getPassage } from "constants/passages";
import { TextTypes } from "constants/settings";
import { RaceStateSubset } from "components/standard-game/hooks/RaceLogic";
import { v4 as uuidv4 } from "uuid";

export const EXPLOSION_TIME = 1200;

const PARTICLE_COLORS = [
  "rgba(255, 0, 0, 0.5)",
  "rgba(0, 255, 0, 0.5)",
  "rgba(0, 0, 255, 0.5)",
];

interface DefenderState {
  level: number;
  score: number;
  health: number;
  multiplier: number;
  errors: number;
  raceState: RaceStateSubset;
  currentEnemyUID: string;
  enemies: EnemyType[];
  shipRotation: number;
  bullets: { offsetLeft: number; uid: string; targetUID: string }[];
  explosions: ExplosionType[];
  isFinished: boolean;
}

const InitialRaceState: RaceStateSubset = {
  currentCharIndex: 0,
  currentWordIndex: 0,
  wordsTyped: 0,
};

const InitialDefenderState: DefenderState = {
  level: 0,
  score: 0,
  health: 100,
  multiplier: 1,
  errors: 0,
  raceState: InitialRaceState,
  currentEnemyUID: "",
  enemies: [],
  shipRotation: 0,
  bullets: [],
  explosions: [],
  isFinished: false,
};

export interface EnemyType {
  type: EnemyVariant;
  raceState: RaceStateSubset;
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
  { shape: "circle", color: "lawngreen", numWords: 10 },
  { shape: "circle", color: "cyan", numWords: 12 },
  { shape: "circle", color: "purple", numWords: 14 },
  { shape: "square", color: "red", numWords: 25 },
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

const getCurrentEnemyIndex = (defenderState: DefenderState): number => {
  return defenderState.enemies.findIndex(
    (enemy) => enemy.uid === defenderState.currentEnemyUID
  );
};

const createEnemyData = (type: EnemyVariant, delay: number): EnemyType => {
  const text = getPassage(TextTypes.TOP_WORDS, type.numWords);

  return {
    type,
    raceState: { ...InitialRaceState },
    charactersTyped: 0,
    uid: uuidv4(),
    text,
    delay,
  };
};

const StartNewRound = (defenderState: DefenderState): DefenderState => {
  const newEnemies = [];
  let currentEnemyUID = "";

  if (defenderState.level === 1) {
    for (let i = 0; i < 6; i++) {
      const enemyData = createEnemyData(EnemyTypes[0], i);
      if (!currentEnemyUID) {
        currentEnemyUID = enemyData.uid;
      }
      newEnemies.push(enemyData);
    }
  } else {
    const enemyAmountIncrease = Math.floor(defenderState.level / 3);
    const numEnemies = enemyAmountIncrease + 6;

    const enemyLevelIncrease = Math.floor((defenderState.level - 1) / 4);
    const hardEnemyPercentage = Math.min(
      ((defenderState.level - 1) % 4) / 4,
      1
    );
    const numHardEnemies = Math.floor(hardEnemyPercentage * numEnemies);

    for (let i = 0; i < numHardEnemies; i++) {
      const enemyData = createEnemyData(
        EnemyTypes[Math.min(enemyLevelIncrease + 1, EnemyTypes.length - 1)],
        i
      );
      if (!currentEnemyUID) {
        currentEnemyUID = enemyData.uid;
      }
      newEnemies.push(enemyData);
    }

    for (let i = numHardEnemies; i < numEnemies; i++) {
      const enemyData = createEnemyData(
        EnemyTypes[Math.min(enemyLevelIncrease, EnemyTypes.length - 1)],
        i
      );
      if (!currentEnemyUID) {
        currentEnemyUID = enemyData.uid;
      }
      newEnemies.push(enemyData);
    }
  }

  return {
    ...defenderState,
    currentEnemyUID,
    raceState: { ...InitialRaceState },
    enemies: newEnemies,
  };
};

const IncreaseLevel = (defenderState: DefenderState): DefenderState => {
  return { ...defenderState, level: defenderState.level + 1 };
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
  const newBullets = [
    ...defenderState.bullets,
    { offsetLeft, uid: uuidv4(), targetUID: defenderState.currentEnemyUID },
  ];
  newDefenderState.bullets = newBullets;
  return newDefenderState;
};

const OnBulletHit = (
  defenderState: DefenderState,
  bulletUID: string,
  enemyBoxRef: React.RefObject<HTMLDivElement>
): DefenderState => {
  let newDefenderState = { ...defenderState };

  const bulletIndex = newDefenderState.bullets.findIndex(
    (bullet) => bullet.uid === bulletUID
  );
  const enemyIndex = defenderState.enemies.findIndex(
    (enemy) => enemy.uid === defenderState.bullets[bulletIndex].targetUID
  );
  if (newDefenderState.enemies[enemyIndex]) {
    const newEnemies = [...newDefenderState.enemies];
    newEnemies[enemyIndex].charactersTyped++;

    if (
      newDefenderState.enemies[enemyIndex].charactersTyped >=
      newDefenderState.enemies[enemyIndex].text.length
    ) {
      newDefenderState = SpawnExplosion(
        defenderState,
        getEnemyOffsetLeft(enemyIndex, enemyBoxRef),
        true
      );
      newEnemies.splice(enemyIndex, 1);
    }
    newDefenderState.enemies = newEnemies;
  }

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

  const currentEnemyIndex = getCurrentEnemyIndex(defenderState);

  newDefenderState = SpawnBullet(newDefenderState, offsetLeft);

  if (defenderState.enemies[currentEnemyIndex]) {
    if (
      defenderState.enemies[currentEnemyIndex].raceState.currentCharIndex >=
      defenderState.enemies[currentEnemyIndex].text.length
    ) {
      if (defenderState.enemies[currentEnemyIndex + 1]) {
        newDefenderState.currentEnemyUID =
          defenderState.enemies[currentEnemyIndex + 1].uid;
        newDefenderState.raceState =
          defenderState.enemies[currentEnemyIndex + 1].raceState;
      } else if (defenderState.enemies[currentEnemyIndex - 1]) {
        newDefenderState.currentEnemyUID =
          defenderState.enemies[currentEnemyIndex - 1].uid;
        newDefenderState.raceState =
          defenderState.enemies[currentEnemyIndex - 1].raceState;
      } else {
        newDefenderState.currentEnemyUID = "";
      }
    }
  }

  newDefenderState.shipRotation = (offsetLeft / enemyBoxWidth - 0.5) * 115;

  return newDefenderState;
};

const DealDamage = (
  defenderState: DefenderState,
  damage: number
): DefenderState => {
  const newHealth = Math.max(defenderState.health - damage, 0);
  if (newHealth === 0) {
    return { ...defenderState, health: 0, isFinished: true };
  } else {
    const newEnemies = defenderState.enemies.slice(1);
    let newCurrentEnemyUID = defenderState.currentEnemyUID;
    let newRaceState = defenderState.raceState;
    if (defenderState.currentEnemyUID === defenderState.enemies[0]?.uid) {
      newCurrentEnemyUID = newEnemies[0]?.uid || "";
      newRaceState = newEnemies[0]?.raceState || { ...InitialRaceState };
    }
    return {
      ...defenderState,
      enemies: newEnemies,
      health: newHealth,
      currentEnemyUID: newCurrentEnemyUID,
      raceState: newRaceState,
    };
  }
};

const ChangeCurrentEnemy = (
  defenderState: DefenderState,
  changeAmount: number
): DefenderState => {
  if (!defenderState.currentEnemyUID) return { ...defenderState };
  let newCurrentEnemyUID = defenderState.currentEnemyUID;
  let newRaceState = defenderState.raceState;
  const currentEnemyIndex = getCurrentEnemyIndex(defenderState);
  const newCurrentEnemy =
    defenderState.enemies[currentEnemyIndex + changeAmount];
  if (newCurrentEnemy) {
    newCurrentEnemyUID = newCurrentEnemy.uid;
    newRaceState = newCurrentEnemy.raceState;
  }
  return {
    ...defenderState,
    currentEnemyUID: newCurrentEnemyUID,
    raceState: newRaceState,
  };
};

const RemoveExplosion = (defenderState: DefenderState): DefenderState => {
  if (defenderState.explosions.length <= 0) return { ...defenderState };
  return { ...defenderState, explosions: defenderState.explosions.slice(1) };
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
  if (defenderState.isFinished) return newDefenderState;
  if (event.ctrlKey) return ChangeCurrentEnemy(newDefenderState, 1);
  const key = event.key;
  const currentEnemyIndex = getCurrentEnemyIndex(defenderState);
  const currentEnemy = defenderState.enemies[currentEnemyIndex];
  if (currentEnemy) {
    if (key === currentEnemy.text[currentEnemy.raceState.currentCharIndex]) {
      const newRaceState = { ...currentEnemy.raceState };
      newRaceState.currentCharIndex++;
      if (key === " ") {
        newRaceState.wordsTyped++;
        newRaceState.currentWordIndex = newRaceState.currentCharIndex;
      }

      newDefenderState.raceState = newRaceState;
      newDefenderState.enemies[currentEnemyIndex].raceState = newRaceState;
      newDefenderState.score += 5 * defenderState.multiplier;
      newDefenderState.multiplier += 0.05;

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
      newDefenderState.errors += 1;
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

interface StartNewRoundAction {
  type: "startNewRound";
}

interface IncreaseLevelAction {
  type: "increaseLevel";
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

interface RemoveExplosionAction {
  type: "removeExplosion";
}

export type DefenderStateReducerActions =
  | KeyDownAction
  | StartNewRoundAction
  | IncreaseLevelAction
  | BulletHitAction
  | DealDamageAction
  | RemoveExplosionAction;

const DefenderStateReducer = (
  state: DefenderState,
  action: DefenderStateReducerActions
): DefenderState => {
  switch (action.type) {
    case "keydown":
      return KeyDown(state, action.event, action.enemyBoxRef);
    case "startNewRound":
      return StartNewRound(state);
    case "increaseLevel":
      return IncreaseLevel(state);
    case "bulletHit":
      return OnBulletHit(state, action.bulletUID, action.enemyBoxRef);
    case "dealDamage":
      return DealDamage(state, action.damage);
    case "removeExplosion":
      return RemoveExplosion(state);
    default:
      throw new Error();
  }
};

export const useDefenderLogic = () => {
  const [defenderState, defenderStateDispatch] = React.useReducer(
    DefenderStateReducer,
    InitialDefenderState
  );

  React.useEffect(() => {
    if (defenderState.enemies.length === 0 && !defenderState.isFinished) {
      setTimeout(
        () => {
          defenderStateDispatch({ type: "increaseLevel" });
        },
        defenderState.level === 0 ? 0 : 500
      );
      setTimeout(() => {
        defenderStateDispatch({ type: "startNewRound" });
      }, 3000);
    }
  }, [defenderState.enemies]);

  React.useEffect(() => {
    setTimeout(() => {
      defenderStateDispatch({ type: "removeExplosion" });
    }, EXPLOSION_TIME);
  }, [defenderState.currentEnemyUID]);

  return {
    defenderState,
    defenderStateDispatch,
  };
};
