import { generateAuthHeader } from "api";
import axios from "axios";
import { API_URL } from "constants/api";
import { Category } from "constants/improvement";
import { GuestUser } from "contexts/AuthContext";
import { User } from "firebase/auth";

export const getImprovementCategories = async (
  currentUser: User | GuestUser
): Promise<Category[]> => {
  const res = await axios.get(API_URL + "/improvement/categories", {
    withCredentials: true,
    headers: await generateAuthHeader(currentUser),
  });

  return res.data?.categories || [];
};
