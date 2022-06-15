import { Button, Grid, Snackbar, Alert } from "@mui/material";
import React from "react";
import { GridCard } from "../../../components/common";
import {
  acceptFriendRequest,
  declineFriendRequest,
  getFriendRequests,
} from "../../../api/rest/user";
import { useAuth } from "../../../contexts/AuthContext";
import { useSnackbar } from "notistack";

export default function InboxComponent() {
  const { currentUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [friendRequests, setFriendRequests] = React.useState<Array<any>>([
    { sender_id: "asdf", username: "adsf" },
  ]);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    // getFriendRequests(currentUser)
    //   .then((requests) => {
    //     setFriendRequests(requests);
    //   })
    //   .catch((err) => {
    //     enqueueSnackbar(err.response?.data || err.message, {
    //       variant: "error",
    //     });
    //     setFriendRequests([]);
    //   });
  }, []);

  const AcceptRequest = (uid: string) => {
    setLoading(true);
    acceptFriendRequest(currentUser, uid)
      .then((res) => {
        enqueueSnackbar(res.data, { variant: "success" });
        setFriendRequests((prev) =>
          prev.filter((val) => val.sender_id !== uid)
        );
      })
      .catch((err) => {
        enqueueSnackbar(err.response?.data || err.message, {
          variant: "error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const DeclineRequest = (uid: string) => {
    setLoading(true);
    declineFriendRequest(currentUser, uid)
      .then((res) => {
        enqueueSnackbar(res.data, { variant: "success" });
        setFriendRequests((prev) =>
          prev.filter((val) => val.sender_id !== uid)
        );
      })
      .catch((err) => {
        enqueueSnackbar(err.response?.data || err.message, {
          variant: "error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <GridCard accent={true}>
        {friendRequests.map((request, i) => (
          <div key={i}>
            {request.username}
            <Button
              disabled={loading}
              onClick={() => AcceptRequest(request.sender_id)}
            >
              ACCEPT
            </Button>
            <Button
              disabled={loading}
              onClick={() => DeclineRequest(request.sender_id)}
            >
              DECLINE
            </Button>
          </div>
        ))}
      </GridCard>
    </>
  );
}
