import React from "react";
import { useHistory } from "react-router-dom";
import ReactGA from "react-ga";
import { useAuth } from "contexts/AuthContext";
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
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <SignupComponent />
      </Grid>
      <Grid item xs={2}></Grid>
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

    const regex = /^[a-zA-Z0-9_.-]*$/;
    if (!regex.test(username) || !username || username.length > 15) {
      setErrorOpen(true);
      setError("Invalid Username");
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
      loginLink
    ></ProfileComponent>
  );
}
