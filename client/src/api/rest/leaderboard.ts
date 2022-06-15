import axios from "axios";
import { Leaderboard } from "../../constants/schemas/leaderboard";
import { GuestUser } from "../../contexts/AuthContext";

export const getLeaderboards = async (): Promise<{
  daily: Leaderboard[];
  allTime: Leaderboard[];
}> => {
  const res = await axios.get("/leaderboard/get-leaderboard");

  return res.data;
};
