import axios from "axios";
import { generateAuthHeader } from "api";
import { User } from "firebase/auth";
import { GuestUser } from "contexts/AuthContext";
import { RaceSchema } from "constants/schemas/race";
import { API_URL } from "constants/api";

export const getPlayerStats = async (
  currentUser: User | GuestUser,
  timeframe: number
): Promise<{ races: Array<RaceSchema> }> => {
  const res = await axios.get(
    API_URL + `/stats/getstats?timeframe=${timeframe}`,
    {
      withCredentials: true,
      headers: await generateAuthHeader(currentUser),
    }
  );

  return res.data;
};
