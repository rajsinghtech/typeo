import { Socket } from "socket.io-client";

const PREFIX = "matchmaking:";

export const JOIN_QUEUE_EVENT = `${PREFIX}join-queue`;
export const LEAVE_QUEUE_EVENT = `${PREFIX}leave-queue`;

export const PLAYER_JOINED_EVENT = `${PREFIX}player-joined`;
export const PLAYER_LEFT_EVENT = `${PREFIX}player-left`;

export const MATCH_STARTING_EVENT = `${PREFIX}match-starting`;
export const JOINED_EXISTING_MATCH_EVENT = `${PREFIX}joined-match`;
export const MATCH_STARTED_EVENT = `${PREFIX}match-started`;
export const MATCH_CANCELED_EVENT = `${PREFIX}match-canceled`;

export const JoinQueue = (socket: Socket) => {
  socket.emit(JOIN_QUEUE_EVENT);
};

export const LeaveQueue = (socket: Socket) => {
  socket.emit(LEAVE_QUEUE_EVENT);
};
