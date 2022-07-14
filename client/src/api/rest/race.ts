import axios from "axios";
import { ResultsData } from "constants/race";
import { generateAuthHeader } from "api";
import { User } from "firebase/auth";
import { GuestUser } from "contexts/AuthContext";
import { API_URL } from "constants/api";

interface PassageResponse {
  passage: string;
}

export const getPassage = async (type: number): Promise<string> => {
  const res = await axios.get<PassageResponse>(
    API_URL + `/race/passage?type=${type}`
  );
  return res.data.passage;
};

export const sendRaceData = async (
  currentUser: User | GuestUser,
  resultsData: ResultsData
) => {
  return axios.post(
    API_URL + "/race/statreport",
    {
      resultsData: resultsData,
    },
    { withCredentials: true, headers: await generateAuthHeader(currentUser) }
  );
};
