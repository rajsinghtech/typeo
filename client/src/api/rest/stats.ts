import React from "react";
import axios from "axios";
import { generateAuthHeader } from "..";
import { User } from "firebase/auth";
import { GuestUser, useAuth } from "../../contexts/AuthContext";
import { RaceStats, StatsStructure, Timeframes } from "../../constants/stats";
import { RaceSchema } from "../../constants/schemas/race";
import { unstable_batchedUpdates } from "react-dom";
import { CharacterData } from "../../constants/race";

export const getPlayerStats = async (
  currentUser: User | GuestUser,
  timeframe: number
): Promise<{ races: Array<RaceSchema> }> => {
  const res = await axios.get(`/stats/getstats?timeframe=${timeframe}`, {
    withCredentials: true,
    headers: await generateAuthHeader(currentUser),
  });

  return res.data;
};
