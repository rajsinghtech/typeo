import axios from "axios";
import { API_URL } from "constants/api";
import { Leaderboard } from "constants/schemas/leaderboard";

export const getLeaderboards = async (): Promise<{
  daily: Leaderboard[];
  allTime: Leaderboard[];
}> => {
  const res = await axios.get(API_URL + "/leaderboard/get-leaderboard");

  return res.data;
};
