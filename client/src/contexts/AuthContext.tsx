import React, { useContext, useEffect } from "react";
import {
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  updateProfile as updateProfileFirebase,
  updateEmail,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "config/firebase";
import { v4 as uuidv4 } from "uuid";

export interface GuestUser {
  displayName: string;
  email: string;
  uid: string;
}

interface Auth {
  currentUser: User | GuestUser;
  login: (email: string, password: string) => Promise<UserCredential | null>;
  signup: (
    email: string,
    username: string,
    password: string
  ) => Promise<UserCredential | null>;
  updateProfile: (email: string, username: string) => void;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  resetPassword: (email: string) => Promise<void>;
}

// eslint-disable-next-line
const instanceOfFireBaseUser = (object: any): object is User => {
  return object.email !== "null";
};

const AuthContext = React.createContext<Auth>({
  currentUser: { displayName: "null", email: "null", uid: "null" },
  login: () => Promise.reject(null),
  signup: () => Promise.reject(null),
  updateProfile: () => null,
  logout: () => Promise.reject(),
  isLoggedIn: false,
  resetPassword: () => Promise.reject(),
});

export function useAuth(): Auth {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const uuid = uuidv4();
  const [currentUser, setCurrentUser] = React.useState<User | GuestUser>({
    displayName: `Guest_${uuid.substring(0, 6)}`,
    email: "null",
    uid: uuid,
  });
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  const signup = async (
    email: string,
    username: string,
    password: string
  ): Promise<UserCredential> => {
    const creds = await createUserWithEmailAndPassword(auth, email, password);
    if (creds && creds.user) {
      await updateProfileFirebase(creds.user, { displayName: username });
    }
    return creds;
  };

  const login = (email: string, password: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const updateProfile = async (email: string, username: string) => {
    if (isLoggedIn) {
      if (email !== currentUser.email) {
        await updateEmail(currentUser as User, email);
      }
      if (username !== currentUser.displayName) {
        await updateProfileFirebase(currentUser as User, {
          displayName: username,
        });
      }
    }
  };

  const logout = async (): Promise<void> => {
    await auth.signOut();
    setIsLoggedIn(false);
  };

  const resetPassword = (email: string): Promise<void> => {
    return sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  auth.onAuthStateChanged((user) => {
    if (user) {
      setCurrentUser(user);
    }
  });

  React.useEffect(() => {
    setIsLoggedIn(instanceOfFireBaseUser(currentUser));
  }, [currentUser]);

  const value: Auth = {
    currentUser,
    isLoggedIn,
    login,
    signup,
    updateProfile,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
