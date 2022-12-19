import React from "react";
import StandardGame from "components/standard-game";
import RacersBox from "components/multiplayer/RacersBox";
import {
  DefaultOnlineGameSettings,
  MatchStatus,
  RaceTypes,
} from "constants/settings";
import { useSocketContext } from "contexts/SocketContext";
import { useHistory } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import OnlineResults from "components/standard-game/results/online-results";
import { ResultsData } from "constants/race";
import {
  JoinQueue,
  PLAYER_JOINED_EVENT,
  PLAYER_LEFT_EVENT,
  MATCH_STARTING_EVENT,
  JOINED_EXISTING_MATCH_EVENT,
  MATCH_STARTED_EVENT,
  MATCH_CANCELED_EVENT,
  LeaveQueue,
} from "api/sockets/matchmaking";

import {
  SERVER_RACE_UPDATE_EVENT,
  RACER_FINISHED_EVENT,
  MatchUpdate,
  RacerFinish,
} from "api/sockets/race";
import {
  Grid,
  Button,
  Dialog,
  Box,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MainHeader from "components/header/main";

export interface OnlineRaceData {
  playerData: Array<PlayerData>;
  finisherData: Array<FinisherData>;
}

interface PlayerData {
  id: string;
  isCorrect: boolean;
  displayName: string;
  currentCharIndex: number;
  wordsTyped: number;
  wpm: string;
  isConnected: boolean;
}

interface FinisherData {
  id: string;
  place: number;
}

const MATCH_COUTDOWN = 12000;

export default function FFAGame() {
  const { currentUser } = useAuth();
  const [onlineRaceData, setOnlineRaceData] = React.useState<OnlineRaceData>({
    playerData: [],
    finisherData: [],
  });
  const [status, setStatus] = React.useState<MatchStatus>(
    MatchStatus.WAITING_FOR_PLAYERS
  );
  const [countdown, setCountdown] = React.useState<number>(0);
  const [passage, setPassage] = React.useState<string>(" ");
  const [countdownInterval, setCountdownInterval] = React.useState<number>(0);

  const [resultsData, setResultsData] = React.useState<ResultsData>({
    passage: "",
    startTime: 0,
    dataPoints: [],
    accuracy: 0,
    characters: { correct: 0, incorrect: 0, total: 0 },
    testType: { name: "", amount: 0, textType: "" },
    characterDataPoints: [],
    raceType: RaceTypes.ONLINE,
  });

  const [place, setPlace] = React.useState<number>(0);
  const [wpm, setWpm] = React.useState<number>(0);

  const [matchUID, setMatchUID] = React.useState<string>("");

  const [resultsOpen, setResultsOpen] = React.useState<boolean>(false);
  const [testDisabled, setTestDisabled] = React.useState<boolean>(true);

  const theme = useTheme();
  const mdScreenSize = useMediaQuery(theme.breakpoints.up("md"));

  const parentRef = React.useRef<HTMLDivElement>(null);

  const { socket } = useSocketContext();
  const history = useHistory();

  const PlayerJoined = (
    player: string,
    players: Array<{ uid: string; displayName: string }>,
    matchPassage: string
  ) => {
    if (passage === " ") setPassage(matchPassage);
    if (players.length === 1) setStatus(MatchStatus.WAITING_FOR_PLAYERS);
    if (currentUser.uid === player) {
      setPlace(0);
    }
    setOnlineRaceData((prevOnlineRaceData) => ({
      ...prevOnlineRaceData,
      playerData: players.map(({ uid, displayName }) => ({
        id: uid,
        isCorrect: true,
        displayName: displayName,
        currentCharIndex: 0,
        wordsTyped: 0,
        wpm: "0",
        isConnected: true,
      })),
    }));
  };

  const PlayerLeft = (player: string) => {
    if (status === MatchStatus.STARTED || currentUser.uid === player) {
      setOnlineRaceData((prevOnlineRaceData) => ({
        ...prevOnlineRaceData,
        playerData: prevOnlineRaceData.playerData.map((prevPlayerData) => ({
          ...prevPlayerData,
          isConnected:
            prevPlayerData.id === player ? false : prevPlayerData.isConnected,
        })),
      }));
      return;
    }
    setOnlineRaceData((prevOnlineRaceData) => ({
      ...prevOnlineRaceData,
      playerData: prevOnlineRaceData.playerData.filter(
        (val) => val.id !== player
      ),
    }));
  };

  const MatchStarting = () => {
    setStatus(MatchStatus.STARTING);
    setCountdown(MATCH_COUTDOWN / 1000 - 1);
    setCountdownInterval(() => {
      const interval = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev === 0) {
            clearInterval(countdownInterval);
            clearInterval();
            return 0;
          } else {
            return prev - 1;
          }
        });
      }, 1000);
      return interval;
    });
  };

  const JoinedExistingMatch = (time: number) => {
    setPlace(0);
    setStatus(MatchStatus.STARTING);
    setCountdown((time - (time % 1000)) / 1000 - 1);
    setTimeout(() => {
      setCountdownInterval(() => {
        const interval = window.setInterval(() => {
          setCountdown((prev) => {
            if (prev === 0) {
              clearInterval(interval);
              return 0;
            } else {
              return prev - 1;
            }
          });
        }, 1000);
        return interval;
      });
    }, time % 1000);
  };

  const MatchCancelled = () => {
    setCountdownInterval((prev) => {
      clearInterval(prev);
      return prev;
    });
    setStatus(MatchStatus.WAITING_FOR_PLAYERS);
  };

  const MatchStarted = () => {
    setCountdownInterval((prev) => {
      clearInterval(prev);
      return prev;
    });
    setStatus(MatchStatus.STARTED);
    setTestDisabled(false);
  };

  const ServerRaceUpdate = (update: MatchUpdate) => {
    if (update) {
      setOnlineRaceData((prevOnlineRaceData) => {
        const playerIndex = prevOnlineRaceData.playerData.findIndex(
          (val) => val.id === update.id
        );
        const prevCopy = [...prevOnlineRaceData.playerData];
        prevCopy[playerIndex] = {
          id: update.id,
          isCorrect: update.isCorrect,
          displayName: prevCopy[playerIndex].displayName,
          currentCharIndex: update.currentCharIndex,
          wordsTyped: update.wordsTyped,
          wpm: update.wpm.toFixed(1),
          isConnected: prevCopy[playerIndex].isConnected,
        };
        return { ...prevOnlineRaceData, playerData: prevCopy };
      });
    }
  };

  const RacerFinished = (racerFinish: RacerFinish) => {
    if (racerFinish) {
      if (racerFinish.id === currentUser.uid) {
        setWpm(racerFinish.wpm);
        setPlace(racerFinish.place);
        setResultsOpen(true);
        //setTestDisabled(true);
      }
      setOnlineRaceData((prevOnlineRaceData) => {
        const playerIndex = prevOnlineRaceData.playerData.findIndex(
          (val) => val.id === racerFinish.id
        );
        const prevCopy = [...prevOnlineRaceData.playerData];
        const prevDisplayName = prevCopy[playerIndex].displayName;
        prevCopy[playerIndex] = {
          ...prevCopy[playerIndex],
          id: racerFinish.id,
          isCorrect: true,
          displayName: prevDisplayName,
          wordsTyped: racerFinish.wordsTyped,
          wpm: `${racerFinish.place} - ${racerFinish.wpm.toFixed(1)}`,
        };
        return {
          playerData: prevCopy,
          finisherData: [
            ...prevOnlineRaceData.finisherData,
            { id: racerFinish.id, place: racerFinish.place },
          ],
        };
      });
    }
  };

  const ResultsDisplay = React.useMemo(() => {
    return (
      <OnlineResults
        open={resultsOpen}
        setOpen={setResultsOpen}
        wpm={wpm}
        data={resultsData}
        place={place}
        container={parentRef.current}
      />
    );
  }, [resultsOpen, wpm, resultsData, place, parentRef.current]);

  const StatusDisplay = React.useMemo(() => {
    return (
      <Dialog
        open={status !== MatchStatus.STARTED}
        container={parentRef.current}
        sx={{ position: "absolute" }}
        disableAutoFocus
        disableEnforceFocus
        onMouseDown={(e) => e.preventDefault()}
      >
        <Box textAlign="center" padding={4}>
          {status === MatchStatus.WAITING_FOR_PLAYERS ? (
            <CircularProgress />
          ) : (
            <Typography variant="h1" color="success">
              {countdown}
            </Typography>
          )}
          {status === MatchStatus.WAITING_FOR_PLAYERS ? (
            <Typography sx={{ marginTop: 3 }}>{status}</Typography>
          ) : null}
          <Button
            variant="contained"
            sx={{ marginTop: 3 }}
            onClick={() => history.push("/multiplayer")}
          >
            <Typography>Leave</Typography>
          </Button>
        </Box>
      </Dialog>
    );
  }, [status, countdown, parentRef.current]);

  const HeaderDisplay = React.useMemo(() => {
    return (
      <>
        {mdScreenSize && (
          <Grid item xs={12} marginBottom={5}>
            <MainHeader />
          </Grid>
        )}
        <Grid item xs={2}></Grid>
      </>
    );
  }, [mdScreenSize]);

  const RacersBoxDisplay = React.useMemo(() => {
    return (
      <Grid item xs={8}>
        <RacersBox racerData={onlineRaceData} passage={passage} />
      </Grid>
    );
  }, [onlineRaceData, passage]);

  const StandardGameDisplay = React.useMemo(() => {
    return (
      <Grid item xs={10}>
        <StandardGame
          settings={DefaultOnlineGameSettings}
          testDisabled={testDisabled}
          onlineRaceData={onlineRaceData}
          setResultsDataProp={setResultsData}
          passage={passage}
        />
      </Grid>
    );
  }, [testDisabled, onlineRaceData, passage]);

  console.log(document.activeElement);

  const ToggleResultsDisplay = React.useMemo(() => {
    return (
      <>
        {!resultsOpen && place !== 0 && (
          <Grid item xs={12} textAlign="center">
            <Box display="flex" justifyContent="center" gap={3}>
              <Button
                variant="contained"
                color="info"
                onClick={() => setResultsOpen(true)}
              >
                Show Results
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  JoinQueue(socket);
                }}
              >
                Find New Match
              </Button>
            </Box>
          </Grid>
        )}
      </>
    );
  }, [resultsOpen, place, status, socket]);

  React.useEffect(() => {
    socket.on(PLAYER_LEFT_EVENT, PlayerLeft);

    return () => {
      socket.removeListener(PLAYER_LEFT_EVENT, PlayerLeft);
    };
  }, [status]);

  React.useEffect(() => {
    socket.on(PLAYER_JOINED_EVENT, PlayerJoined);
    socket.on(MATCH_STARTING_EVENT, MatchStarting);
    socket.on(JOINED_EXISTING_MATCH_EVENT, JoinedExistingMatch);
    socket.on(MATCH_CANCELED_EVENT, MatchCancelled);
    socket.on(MATCH_STARTED_EVENT, MatchStarted);
    socket.on(SERVER_RACE_UPDATE_EVENT, ServerRaceUpdate);
    socket.on(RACER_FINISHED_EVENT, RacerFinished);

    JoinQueue(socket);

    return () => {
      socket.removeListener(PLAYER_JOINED_EVENT, PlayerJoined);
      socket.removeListener(MATCH_STARTING_EVENT, MatchStarting);
      socket.removeListener(JOINED_EXISTING_MATCH_EVENT, JoinedExistingMatch);
      socket.removeListener(MATCH_CANCELED_EVENT, MatchCancelled);
      socket.removeListener(MATCH_STARTED_EVENT, MatchStarted);
      socket.removeListener(SERVER_RACE_UPDATE_EVENT, ServerRaceUpdate);
      socket.removeListener(RACER_FINISHED_EVENT, RacerFinished);

      LeaveQueue(socket);
    };
  }, []);

  return (
    <>
      <Box ref={parentRef} position="relative" minHeight="80vh">
        <Grid container spacing={3}>
          {ResultsDisplay}
          {StatusDisplay}
          {HeaderDisplay}
          {RacersBoxDisplay}
          {React.useMemo(
            () => (
              <>
                <Grid item xs={2}></Grid>
                <Grid item xs={1}></Grid>
              </>
            ),
            []
          )}
          {StandardGameDisplay}
          {ToggleResultsDisplay}
          {React.useMemo(
            () => (
              <Grid item xs={2}></Grid>
            ),
            []
          )}
        </Grid>
      </Box>
    </>
  );
}

export const PLAYER_COLORS = [
  "red",
  "cyan",
  "lime",
  "yellow",
  "purple",
  "white",
];
