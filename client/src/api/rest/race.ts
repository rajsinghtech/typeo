import React from "react";
import axios from "axios";
import { CharacterData } from "../../constants/race";
import { ResultsData } from "../../constants/race";
import { RaceStats } from "../../constants/stats";
import { generateAuthHeader } from "..";
import { User } from "firebase/auth";
import { GuestUser } from "../../contexts/AuthContext";

interface PassageResponse {
  passage: string;
}

export const getPassage = async (type: number): Promise<string> => {
  const res = await axios.get<PassageResponse>(`/race/passage?type=${type}`);
  return res.data.passage;
};

export const sendRaceData = async (
  currentUser: User | GuestUser,
  resultsData: ResultsData
) => {
  return axios.post(
    "/race/statreport",
    {
      resultsData: resultsData,
    },
    { withCredentials: true, headers: await generateAuthHeader(currentUser) }
  );
};
