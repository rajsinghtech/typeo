import React from "react";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { useAuth } from "contexts/AuthContext";
import { User } from "firebase/auth";
import { API_URL } from "constants/api";

interface S_Context {
  socket: Socket;
}

const initialSocket = API_URL
  ? io(API_URL, { autoConnect: false })
  : io({ autoConnect: false });

const SocketContext = React.createContext<S_Context>({ socket: initialSocket });

export function useSocketContext() {
  return React.useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoggedIn } = useAuth();
  const [socket] = React.useState<Socket>(initialSocket);

  const value = {
    socket,
  };

  React.useEffect(() => {
    socket.on("connect_error", (err) => {
      console.error(err);
    });

    if (!isLoggedIn) {
      socket.auth = { token: currentUser.uid };
      socket.connect();
      return;
    }

    (currentUser as User)
      .getIdToken()
      .then((res) => {
        socket.auth = {
          token: res,
        };

        socket.connect();
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      socket.removeAllListeners();
    };
  }, [isLoggedIn]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
