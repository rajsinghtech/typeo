import React from "react";
import { Socket } from "socket.io-client";
import {
  Grid,
  Button,
  Dialog,
  Box,
  Typography,
  CircularProgress,
  Modal,
} from "@mui/material";
import StandardGame from "../components/Standard";
import RacersBox from "../components/standardComponents/RacersBox";
import {
  DefaultOnlineGameSettings,
  MatchStatus,
} from "../../../constants/settings";
import { useSocketContext } from "../../../contexts/SocketContext";
import {
  JoinQueue,
  JOIN_QUEUE_EVENT,
  PLAYER_JOINED_EVENT,
  PLAYER_LEFT_EVENT,
  MATCH_STARTING_EVENT,
  JOINED_EXISTING_MATCH_EVENT,
  MATCH_STARTED_EVENT,
  MATCH_CANCELED_EVENT,
  LeaveQueue,
} from "../../../api/sockets/matchmaking";

import {
  SERVER_RACE_UPDATE_EVENT,
  RACER_FINISHED_EVENT,
  RACE_COMPLETE_EVENT,
  MatchUpdate,
  RacerFinish,
} from "../../../api/sockets/race";
import { useHistory } from "react-router-dom";
import { GridCard } from "../../common";
import { useAuth } from "../../../contexts/AuthContext";
import OnlineResults from "../components/results/OnlineResults";
import { ResultsData } from "../../../constants/race";
import useRaceLogic from "../RaceLogic";

export interface OnlineRaceData {
  playerData: Array<PlayerData>;
  finisherData: Array<FinisherData>;
}

interface PlayerData {
  id: string;
  displayName: string;
  percentage: number;
  wordsTyped: number;
  wpm: string;
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
  });

  const [place, setPlace] = React.useState<number>(0);
  const [wpm, setWpm] = React.useState<number>(0);

  const [resultsOpen, setResultsOpen] = React.useState<boolean>(false);
  const [testDisabled, setTestDisabled] = React.useState<boolean>(true);

  const raceLogic = useRaceLogic({
    passage: passage,
    settings: DefaultOnlineGameSettings,
    testDisabled: testDisabled,
    setResultsDataProp: setResultsData,
  });

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
    setOnlineRaceData({
      ...onlineRaceData,
      playerData: players.map(({ uid, displayName }) => ({
        id: uid,
        displayName: displayName,
        percentage: 0,
        wordsTyped: 0,
        wpm: "0",
      })),
    });
  };

  const PlayerLeft = (player: string, players: Array<string>) => {
    setOnlineRaceData((prevOnlineRaceData) => ({
      ...onlineRaceData,
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
          displayName: prevCopy[playerIndex].displayName,
          percentage: update.percentage,
          wordsTyped: update.wordsTyped,
          wpm: update.wpm.toFixed(1),
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
          id: racerFinish.id,
          displayName: prevDisplayName,
          percentage: 1,
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

  const OnLeaveMatch = () => {
    LeaveQueue(socket);
    history.push("/");
  };

  React.useEffect(() => {
    socket.on(PLAYER_JOINED_EVENT, PlayerJoined);
    socket.on(PLAYER_LEFT_EVENT, PlayerLeft);
    socket.on(MATCH_STARTING_EVENT, MatchStarting);
    socket.on(JOINED_EXISTING_MATCH_EVENT, JoinedExistingMatch);
    socket.on(MATCH_CANCELED_EVENT, MatchCancelled);
    socket.on(MATCH_STARTED_EVENT, MatchStarted);
    socket.on(SERVER_RACE_UPDATE_EVENT, ServerRaceUpdate);
    socket.on(RACER_FINISHED_EVENT, RacerFinished);

    JoinQueue(socket);

    return () => {
      socket.removeListener(PLAYER_JOINED_EVENT, PlayerJoined);
      socket.removeListener(PLAYER_LEFT_EVENT, PlayerLeft);
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
      <OnlineResults
        open={resultsOpen}
        setOpen={setResultsOpen}
        wpm={wpm}
        data={resultsData}
        place={place}
      />
      <Grid
        container
        spacing={3}
        sx={{ marginTop: 0, position: "relative" }}
        ref={parentRef}
      >
        <Dialog
          open={status !== MatchStatus.STARTED}
          container={parentRef.current}
          sx={{ position: "absolute" }}
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
              onClick={() => history.push("/")}
            >
              <Typography>Leave</Typography>
            </Button>
          </Box>
        </Dialog>
        <Grid item xs={1}></Grid>
        <Grid item xs={10}>
          <RacersBox racerData={onlineRaceData} />
        </Grid>
        <Grid item xs={12}>
          <StandardGame
            raceLogic={raceLogic}
            settings={DefaultOnlineGameSettings}
            testDisabled={testDisabled}
            onlineRaceData={onlineRaceData}
            setResultsDataProp={setResultsData}
          />
        </Grid>
        <Grid item xs={12} textAlign="center">
          {!resultsOpen && place !== 0 ? (
            <Button
              variant="contained"
              sx={{
                margin: 2,
              }}
              onClick={() => setResultsOpen(true)}
            >
              Show Results
            </Button>
          ) : null}
        </Grid>
        <Grid item xs={2}></Grid>
      </Grid>
      {/* <Button onClick={OnLeaveMatch}>Leave</Button> */}
    </>
  );
}
