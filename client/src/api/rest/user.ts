import axios from "axios";
import { User } from "firebase/auth";
import { GuestUser } from "../../contexts/AuthContext";
import { generateAuthHeader } from "..";

export const createUser = async (
  currentUser: User | GuestUser,
  username: string
) => {
  return await axios.post(
    "/user/user-create",
    {
      username: username,
    },
    {
      withCredentials: true,
      headers: await generateAuthHeader(currentUser),
    }
  );
};

export const sendFriendRequest = async (
  currentUser: User | GuestUser,
  uid: string
) => {
  return await axios.post(
    "/user/friend_request",
    {
      uid: uid,
    },
    {
      withCredentials: true,
      headers: await generateAuthHeader(currentUser),
    }
  );
};

export const acceptFriendRequest = async (
  currentUser: User | GuestUser,
  uid: string
) => {
  return await axios.post(
    "/user/accept_request",
    {
      uid: uid,
    },
    {
      withCredentials: true,
      headers: await generateAuthHeader(currentUser),
    }
  );
};

export const declineFriendRequest = async (
  currentUser: User | GuestUser,
  uid: string
) => {
  return await axios.post(
    "/user/decline_request",
    {
      uid: uid,
    },
    {
      withCredentials: true,
      headers: await generateAuthHeader(currentUser),
    }
  );
};

export const getFriendRequests = async (currentUser: User | GuestUser) => {
  const res = await axios.get("/user/friend_requests", {
    withCredentials: true,
    headers: await generateAuthHeader(currentUser),
  });
  return res.data;
};

export interface Friend {
  uid: string;
  username: string;
}

export const getFriends = async (currentUser: User | GuestUser) => {
  const res = await axios.get("/user/friends", {
    withCredentials: true,
    headers: await generateAuthHeader(currentUser),
  });
  return res.data;
};
