import React from "react";
import { useHistory } from "react-router-dom";
import ReactGA from "react-ga";
import { useAuth } from "contexts/AuthContext";
import { auth } from "config/firebase";
import { getRedirectResult } from "firebase/auth";
import ProfileComponent from "components/profile/profile-component";
import Grid from "@mui/material/Grid";

export default function Signup() {
  React.useEffect(() => {
    ReactGA.event({
      category: "User",
      action: "Signup Page Visited",
    });
  }, []);
  return (
    <Grid container spacing={3}>
      <Grid item xs={0} sm={2} lg={3}></Grid>
      <Grid item xs={12} sm={8} lg={6}>
        <SignupComponent />
      </Grid>
      <Grid item xs={0} sm={2} lg={3}></Grid>
    </Grid>
  );
}

function SignupComponent() {
  const { signup } = useAuth();

  const [errorOpen, setErrorOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      email: { value: string };
      username: { value: string };
      password: { value: string };
      passwordConfirm: { value: string };
    };

    const email = target.email.value;
    const username = target.username.value;
    const password = target.password.value;
    const passwordConfirm = target.passwordConfirm.value;

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

    if (password !== passwordConfirm) {
      setErrorOpen(true);
      setError("Passwords do not match");
      return;
    }

    setErrorOpen(false);
    setError("");
    setLoading(true);

    try {
      await signup(email, username, password);
      history.push("/");
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

  React.useEffect(() => {
    getRedirectResult(auth).catch(() => {
      setError("Could not login");
      setErrorOpen(true);
    });
  }, []);

  return (
    <ProfileComponent
      name="Signup"
      handleSubmit={handleSubmit}
      errorOpen={errorOpen}
      error={error}
      loading={loading}
      fields={[
        { name: "username", type: "text", label: "Username", autoComplete: "" },
        {
          name: "email",
          type: "email",
          label: "Email Address",
          autoComplete: "",
        },
        {
          name: "password",
          type: "password",
          label: "Password",
          autoComplete: "new-password",
        },
        {
          name: "passwordConfirm",
          type: "password",
          label: "Confirm Password",
          autoComplete: "new-password",
        },
      ]}
      alternateLogins
      loginLink
    ></ProfileComponent>
  );
}
