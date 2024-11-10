export interface RankData {
  rankImage: string;
  rankName: string;
  rankColor: string;
  rankShadow: string;
  rankProgress: number;
  prevRankName: string;
  prevRankImage: string;
  nextRankName: string;
  nextRankImage: string;
  wpmForNextRank: string;
}

export const RANK_NAMES = [
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
];

export const RANK_COLORS = [
  "#CD7F32",
  "#C0C0C0",
  "#FFD700",
  "#00FFFF",
  "#00BFFF",
  "#663A82",
  "primary.main",
];

export const RANK_SHADOWS = [
  "0px 0px 5px #CD7F32",
  "0px 0px 5px #C0C0C0",
  "0px 0px 5px #FFD700",
  "0px 0px 5px #00FFFF",
  "0px 0px 5px #00BFFF",
  "0px 0px 5px #663A82",
  "0px 0px 5px #F9252B",
];

export const RANK_ICONS = [
  "Bronze.png",
  "Silver.png",
  "Gold.png",
  "Platinum.png",
  "Diamond.png",
  "Master.png",
  "Grandmaster.png",
];
