import React from "react";
import { getPassage } from "constants/passages";
import { Difficulty, TextTypes } from "constants/settings";
import { RaceStateSubset } from "components/standard-game/hooks/RaceLogic";
import {
  EnemyType,
  EnemyVariant,
  ENEMY_VARIANTS,
} from "components/defender/enemy";
import {
  ExplosionType,
  EXPLOSION_TIME,
  PARTICLE_COLORS,
} from "components/defender/explosion";
import { v4 as uuidv4 } from "uuid";
import { useGameSettings } from "contexts/GameSettings";

const BONUS_ROUND = 7;

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
    isReachable: true,
  };
};

const StartNewRound = (
  defenderState: DefenderState,
  difficulty: Difficulty
): DefenderState => {
  const newEnemies = [];
  let currentEnemyUID = "";

  const difficulties = ["easy", "medium", "hard", "impossible"];
  const bonusRounds = Math.floor(defenderState.level / BONUS_ROUND);
  const difficultyLevel =
    defenderState.level + difficulties.indexOf(difficulty) - bonusRounds;
  if (difficultyLevel === 1) {
    for (let i = 0; i < 6; i++) {
      const enemyData = createEnemyData(ENEMY_VARIANTS[0], i * 1.5);
      if (!currentEnemyUID) {
        currentEnemyUID = enemyData.uid;
      }
      newEnemies.push(enemyData);
    }
  } else if (defenderState.level % BONUS_ROUND === 0) {
    for (let i = 0; i < 15; i++) {
      const enemyData = createEnemyData(ENEMY_VARIANTS[i % 3], i * 1.5);
      if (!currentEnemyUID) {
        currentEnemyUID = enemyData.uid;
      }
      newEnemies.push(enemyData);
    }
  } else {
    const enemyAmountIncrease = Math.floor(difficultyLevel / 3);
    const numEnemies = enemyAmountIncrease + 6;

    const enemyLevelIncrease = Math.floor((difficultyLevel - 1) / 4);
    const hardEnemyPercentage = Math.min(((difficultyLevel - 1) % 4) / 4, 1);
    const numHardEnemies = Math.floor(hardEnemyPercentage * numEnemies);

    for (let i = 0; i < numHardEnemies; i++) {
      const enemyData = createEnemyData(
        ENEMY_VARIANTS[
          Math.min(enemyLevelIncrease + 1, ENEMY_VARIANTS.length - 1)
        ],
        i * 1.5
      );
      if (!currentEnemyUID) {
        currentEnemyUID = enemyData.uid;
      }
      newEnemies.push(enemyData);
    }

    for (let i = numHardEnemies; i < numEnemies; i++) {
      const enemyData = createEnemyData(
        ENEMY_VARIANTS[Math.min(enemyLevelIncrease, ENEMY_VARIANTS.length - 1)],
        i * 1.5
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

const moveToNextAvailableEnemy = (
  defenderState: DefenderState
): DefenderState => {
  let newCurrentEnemyUID = "";
  let newRaceState = { ...InitialRaceState };
  for (const enemy of defenderState.enemies) {
    if (
      enemy.raceState.currentCharIndex < enemy.text.length &&
      enemy.isReachable
    ) {
      newCurrentEnemyUID = enemy.uid;
      newRaceState = { ...enemy.raceState };
      break;
    }
  }

  return {
    ...defenderState,
    currentEnemyUID: newCurrentEnemyUID,
    raceState: newRaceState,
  };
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
      newDefenderState.health += 1;
      newEnemies.splice(enemyIndex, 1);
    }
    newDefenderState.enemies = newEnemies;
  }

  const newBullets = [...defenderState.bullets];
  newBullets.splice(bulletIndex, 1);
  newDefenderState.bullets = newBullets;
  return newDefenderState;
};

const TakeDamage = (
  defenderState: DefenderState,
  enemyUID: string,
  damage: number
): DefenderState => {
  const newHealth =
    defenderState.level % BONUS_ROUND === 0
      ? defenderState.health
      : Math.max(defenderState.health - damage, 0);
  if (newHealth === 0) {
    return { ...defenderState, health: 0, isFinished: true };
  } else {
    const newDefenderState = { ...defenderState };
    const newEnemies = [...defenderState.enemies];
    const enemyIndex = defenderState.enemies.findIndex(
      (enemy) => enemy.uid === enemyUID
    );
    newEnemies.splice(enemyIndex, 1);
    newDefenderState.enemies = newEnemies;
    newDefenderState.health = newHealth;
    if (
      defenderState.currentEnemyUID === defenderState.enemies[enemyIndex]?.uid
    ) {
      return moveToNextAvailableEnemy(newDefenderState);
    }
    return newDefenderState;
  }
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

      const bonusRound = defenderState.level % BONUS_ROUND === 0;
      newDefenderState.score +=
        5 * defenderState.multiplier * (bonusRound ? 2 : 1);
      newDefenderState.multiplier += bonusRound ? 0.1 : 0.05;

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
      if (defenderState.level % BONUS_ROUND !== 0)
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
  difficulty: Difficulty;
}

interface IncreaseLevelAction {
  type: "increaseLevel";
}

interface BulletHitAction {
  type: "bulletHit";
  bulletUID: string;
  enemyBoxRef: React.RefObject<HTMLDivElement>;
}

interface TakeDamageAction {
  type: "takeDamage";
  enemyUID: string;
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
  | TakeDamageAction
  | RemoveExplosionAction;

const DefenderStateReducer = (
  state: DefenderState,
  action: DefenderStateReducerActions
): DefenderState => {
  switch (action.type) {
    case "keydown":
      return KeyDown(state, action.event, action.enemyBoxRef);
    case "startNewRound":
      return StartNewRound(state, action.difficulty);
    case "increaseLevel":
      return IncreaseLevel(state);
    case "bulletHit":
      return OnBulletHit(state, action.bulletUID, action.enemyBoxRef);
    case "takeDamage":
      return TakeDamage(state, action.enemyUID, action.damage);
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

  const { gameSettings } = useGameSettings();
  const difficulty = gameSettings.defender.difficulty;

  React.useEffect(() => {
    if (defenderState.enemies.length === 0 && !defenderState.isFinished) {
      setTimeout(
        () => {
          defenderStateDispatch({ type: "increaseLevel" });
        },
        defenderState.level === 0 ? 0 : 500
      );
      setTimeout(() => {
        defenderStateDispatch({ type: "startNewRound", difficulty });
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
