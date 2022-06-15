import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Card,
  Typography,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
} from "@mui/material";
import { GridCard } from "../common";
import { Box } from "@mui/system";
import { getFriends } from "../../api/rest/user";
import { RECEIVED_CHAT_EVENT, SEND_CHAT_EVENT } from "../../api/sockets/chat";
import { useSocketContext } from "../../contexts/SocketContext";
import { Friend } from "../../api/rest/user";

interface ChatMessage {
  message: string;
  to: string;
  from: string;
}

const Chat = (props: { uid: string; messages: Array<ChatMessage> }) => {
  const { currentUser } = useAuth();
  const { socket } = useSocketContext();
  const inputRef = React.useRef<HTMLInputElement>();

  const chatStyles = {
    messageBox: {
      height: "75%",
    },
    divider: {},
    textInput: {
      margin: "5px 0",
      padding: "0 5px",
      width: "100%",
    },
    message: {
      padding: "5px",
      margin: "20px 10px",
    },
  };

  const OnSendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const message = inputRef.current?.value;
      if (!message) return;
      socket.emit(SEND_CHAT_EVENT, { message, to: props.uid });
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <Box sx={chatStyles.messageBox}>
        {props.messages.map((message) => {
          return (
            <Box key={message.from} sx={{ width: "100%" }}>
              <Card
                sx={{
                  ...chatStyles.message,
                  float: message.from === currentUser.uid ? "right" : "left",
                }}
              >
                {message.message}
              </Card>
            </Box>
          );
        })}
      </Box>
      <Divider sx={chatStyles.divider} />
      <TextField
        variant="standard"
        sx={chatStyles.textInput}
        placeholder="Enter your message here..."
        onKeyDown={OnSendMessage}
        inputRef={inputRef}
      />
    </>
  );
};

export default function ChatBox() {
  const { currentUser, isLoggedIn } = useAuth();
  const { socket } = useSocketContext();

  const [friends, setFriends] = React.useState<Array<Friend>>([]);
  const [messages, setMessages] = React.useState<Array<Array<ChatMessage>>>([]);
  const [openMessageIndex, setOpenMessageIndex] = React.useState<number>(0);

  const [open, setOpen] = React.useState<boolean>(false);
  const [chatOpen, setChatOpen] = React.useState<boolean>(false);

  const styles = {
    root: {
      position: "fixed",
      bottom: 0,
      right: "4%",
      width: "260px",
      background:
        "linear-gradient(166deg, rgba(255,0,0,1) 0%, rgba(255,72,0,1) 50%, rgba(255,111,0,1) 100%)",
    },
    inner: {
      height: "260px",
      width: "100%",
      color: "white",
      paddingBottom: "25px",
      overflow: "scroll",
      "&::-webkit-scrollbar": {
        display: "none",
      },
      msOverflowStyle: "none",
      scrollbarWidth: "none",
    },
    headText: {
      cursor: "pointer",
      padding: "10px",
    },
    friendButton: {
      width: "100%",
      textAlign: "left",
    },
    friendItem: {
      borderBottom: "1px solid gray",
    },
  };

  const ReceivedChat = ({ message, to, from }: ChatMessage) => {
    const messagesCopy = [...messages];
    console.log(from, to);
    const other = to === currentUser.uid ? from : to;
    console.log(other);
    console.log(friends.map((friend) => friend.uid));
    const otherindex = friends
      .map((friend) => friend.uid)
      .indexOf(to === currentUser.uid ? from : to);
    console.log(otherindex);
    messagesCopy[otherindex].push({ message, to, from });
  };

  const OpenChat = (index: number) => {
    setChatOpen(true);
    setOpenMessageIndex(index);
  };

  React.useEffect(() => {
    getFriends(currentUser)
      .then((res) => {
        console.log(res);
        setFriends(res);
        setMessages(res.map(() => []));
        // setMessages([
        //   [
        //     { uid: "x", message: "Yo what is up my guy" },
        //     {
        //       uid: "lX3DEXyTrIXgmBTaeBlsYkH3a0H2",
        //       message: "Yo what is up my guy",
        //     },
        //   ],
        //   [],
        // ]);
      })
      .catch((err) => {
        console.log(err.message);
      });

    socket.on(RECEIVED_CHAT_EVENT, ReceivedChat);

    return () => {
      socket.removeListener(RECEIVED_CHAT_EVENT, ReceivedChat);
    };
  }, []);

  return (
    <Card elevation={12} sx={styles.root}>
      <Typography sx={styles.headText} onClick={() => setOpen((prev) => !prev)}>
        {isLoggedIn ? "Messages" : "Login To Chat"}
      </Typography>
      {open && isLoggedIn ? (
        <GridCard padding="5px" sx={styles.inner}>
          {!chatOpen ? (
            friends.map((friend, i) => {
              return (
                <Box key={friend.uid} sx={styles.friendItem}>
                  <Button sx={styles.friendButton} onClick={() => OpenChat(i)}>
                    <Grid container>
                      <Grid item xs={3} sx={{ paddingTop: "7px" }}>
                        <Avatar sx={{ width: 28, height: 28 }}>
                          {friend.username.substring(0, 2)}
                        </Avatar>
                      </Grid>
                      <Grid item xs={9}>
                        <Box>
                          <Typography variant="subtitle2">
                            {friend.username}
                          </Typography>
                          <Typography variant="caption" fontSize={"10px"}>
                            sample text
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Button>
                </Box>
              );
            })
          ) : (
            <>
              <Button onClick={() => setChatOpen(false)}>{"<"}</Button>
              <Chat
                uid={friends[openMessageIndex].uid}
                messages={messages[openMessageIndex]}
              />
            </>
          )}
        </GridCard>
      ) : null}
    </Card>
  );
}
