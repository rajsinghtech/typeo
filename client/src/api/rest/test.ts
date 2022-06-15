import axios from "axios";
import { User } from "firebase/auth";
import { generateAuthHeader } from "../";
import { API_URL } from "../../constants/api";
import { GuestUser } from "../../contexts/AuthContext";

export const getTestData = async (currentUser: User | GuestUser) => {
  const res = await axios.get(API_URL + "/test", {
    withCredentials: true,
    headers: await generateAuthHeader(currentUser),
  });
  return JSON.stringify(res.data);
};
