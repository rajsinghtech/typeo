import { User } from "firebase/auth";
import { GuestUser } from "contexts/AuthContext";

export const generateAuthHeader = async (currentUser: User | GuestUser) => {
  if (currentUser.email === "null") return null;
  const token = await (currentUser as User).getIdToken();
  return {
    "Content-Type": "application/json",
    authorization: `Bearer ${token}`,
  };
};
