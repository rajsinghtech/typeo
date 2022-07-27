import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import ReactGA from "react-ga";
import { useAuth } from "contexts/AuthContext";
import ProfileComponent from "components/profile/profile-component";
import Grid from "@mui/material/Grid";

export default function UpdateProfile() {
  React.useEffect(() => {
    ReactGA.event({
      category: "User",
      action: "Update Profile Page Visited",
    });
  }, []);
  return (
    <Grid container spacing={3}>
      <Grid item xs={0} sm={2} lg={3}></Grid>
      <Grid item xs={12} sm={8} lg={6}>
        <UpdateProfileComponent />
      </Grid>
      <Grid item xs={0} sm={2} lg={3}></Grid>
    </Grid>
  );
}

interface LocationState {
  loading: boolean;
  message: string;
  messageOpen: boolean;
}

function UpdateProfileComponent() {
  const { currentUser, updateProfile } = useAuth();

  const location = useLocation<LocationState>();

  const [errorOpen, setErrorOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(
    location.state?.loading || false
  );
  const [message, setMessage] = React.useState(location.state?.message || "");
  const [messageOpen, setMessageOpen] = React.useState(
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

    if (!username || username.length > 20) {
      setErrorOpen(true);
      setError("Username must be less than 20 characters");
      return;
    }

    const regex = /^[a-zA-Z0-9_.-]*$/;
    if (!regex.test(username)) {
      setErrorOpen(true);
      setError(
        "Username can only contain letters, numbers, underscore, period, and dash"
      );
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
    } catch (err) {
      setErrorOpen(true);
      let newErrorMessage = "Something Went Wrong";
      if (err instanceof Error) {
        newErrorMessage = err.message;
      }
      setError(newErrorMessage);
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
        email: currentUser.email,
        username: currentUser.displayName,
      }}
    ></ProfileComponent>
  );
}
