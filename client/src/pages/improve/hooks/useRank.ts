import { clamp } from "components/standard-game/feedback/speed-progress";
import {
  RankData,
  RANK_COLORS,
  RANK_ICONS,
  RANK_NAMES,
  RANK_SHADOWS,
} from "constants/rank";

export default function useRank(wpm: number, accuracy: number) {
  const rankIndex = getRankIndex(wpm, accuracy);

  const rankProgress = getRankProgress(wpm, accuracy) * 100;

  const prevRankName = RANK_NAMES[rankIndex - 1];
  const prevRankImage = RANK_ICONS[rankIndex - 1];

  const nextRankName = RANK_NAMES[rankIndex + 1];
  const nextRankImage = RANK_ICONS[rankIndex + 1];

  const wpmForNextRank = getWpmForNextRank(wpm, accuracy).toFixed(1);
  //   const accuracyForNextRank = getAccuracyForNextRank(
  //     baseStats.averages.wpm,
  //     baseStats.averages.accuracy
  //   ).toFixed(1);

  const rankData: RankData = {
    rankImage: RANK_ICONS[rankIndex],
    rankName: RANK_NAMES[rankIndex],
    rankColor: RANK_COLORS[rankIndex],
    rankShadow: RANK_SHADOWS[rankIndex],
    rankProgress,
    prevRankName,
    prevRankImage,
    nextRankName,
    nextRankImage,
    wpmForNextRank,
  };

  return rankData;
}

const getRankScore = (wpm: number, accuracy: number) => {
  const rankScore =
    (clamp(wpm, 0, 170) + 27) ** 2.5 / 170 ** 2.611 +
    (clamp(accuracy, 85, 100) - 72) ** 2.7 / 15 ** 3.95;
  return clamp(rankScore, 0, 1);
};

const getRankIndex = (wpm: number, accuracy: number) => {
  const rankScore = getRankScore(wpm, accuracy);

  return clamp(Math.floor(rankScore / (1 / 7)), 0, RANK_NAMES.length - 1);
};

const getRankProgress = (wpm: number, accuracy: number) => {
  const rankScore = getRankScore(wpm, accuracy);

  return (rankScore % (1 / 7)) / (1 / 7);
};

const getWpmForNextRank = (wpm: number, accuracy: number) => {
  const rankScore = getRankScore(wpm, accuracy);
  const scoreForNextRank =
    rankScore + (1 - getRankProgress(wpm, accuracy)) * (1 / 7);

  console.log(rankScore);
  return (
    Math.pow(
      (scoreForNextRank - (clamp(accuracy, 85, 100) - 72) ** 2.7 / 15 ** 3.95) *
        170 ** 2.611,
      1 / 2.5
    ) - 27
  );
};

// const getAccuracyForNextRank = (wpm: number, accuracy: number) => {
//   const rankScore = getRankScore(wpm, accuracy);
//   const scoreForNextRank =
//     rankScore + (1 - getRankProgress(wpm, accuracy)) * (1 / 7);

//   return (
//     Math.pow(
//       (scoreForNextRank - (clamp(wpm, 0, 170) + 27) ** 2.5 / 170 ** 2.611) *
//         15 ** 3.95,
//       1 / 2.7
//     ) + 72
//   );
// };
