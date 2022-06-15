import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import { useAuth } from "../../../contexts/AuthContext";
import { styled } from "@mui/system";
import ProfileComponent from "../ProfileComponent";

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "24px",
}));

const StyledForm = styled("form")(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(3),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.secondary.main,
}));

interface LocationState {
  loading: boolean;
  message: string;
  messageOpen: boolean;
}

export default function UpdateProfileComponent(props: any) {
  const { currentUser, updateProfile } = useAuth();

  const location = useLocation<LocationState>();

  const [errorOpen, setErrorOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(location.state?.loading || false);
  const [message, setMessage] = useState(location.state?.message || "");
  const [messageOpen, setMessageOpen] = useState(
    location.state?.messageOpen || false
  );

  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      email: { value: string };
      username: { value: string };
    };

    const email = target.email.value;
    const username = target.username.value;

    const regex = /^[a-zA-Z0-9_.-]*$/;
    if (!regex.test(username) || !username || username.length > 15) {
      setErrorOpen(true);
      setError("Invalid Username");
      return;
    }

    setErrorOpen(false);
    setError("");
    setLoading(true);
    setMessage("");
    setMessageOpen(false);

    try {
      await updateProfile(email, username);
      history.push({
        pathname: "/update-profile",
        state: {
          message: "Successfully Updated Profile",
          messageOpen: true,
          loading: false,
        },
      });
      history.go(0);
    } catch (err: any) {
      setErrorOpen(true);
      setError(`${err.response?.data || err}`);
      setLoading(false);
    }
  };

  return (
    <ProfileComponent
      name="Update Profile"
      handleSubmit={handleSubmit}
      errorOpen={errorOpen}
      error={error}
      message={message}
      messageOpen={messageOpen}
      loading={loading}
      fields={[
        { name: "username", type: "text", label: "Username", autoComplete: "" },
        {
          name: "email",
          type: "email",
          label: "Email Address",
          autoComplete: "",
        },
      ]}
      fillDefaults={{
        email: currentUser.email!,
        username: currentUser.displayName!,
      }}
    ></ProfileComponent>
  );
}
