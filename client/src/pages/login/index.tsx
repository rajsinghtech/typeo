import React from "react";
import { useHistory } from "react-router-dom";
import { auth } from "config/firebase";
import { getRedirectResult } from "firebase/auth";
import ReactGA from "react-ga";
import { useAuth } from "contexts/AuthContext";
import ProfileComponent from "components/profile/profile-component";
import { Grid } from "@mui/material";

export default function Login() {
  React.useEffect(() => {
    ReactGA.event({
      category: "User",
      action: "Login Page Visited",
    });
  }, []);
  return (
    <Grid container spacing={3}>
      <Grid item xs={0} sm={2} lg={3}></Grid>
      <Grid item xs={12} sm={8} lg={6}>
        <LoginComponent />
      </Grid>
      <Grid item xs={0} sm={2} lg={3}></Grid>
    </Grid>
  );
}

function LoginComponent() {
  const { login } = useAuth();
  const [errorOpen, setErrorOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };

    const email = target.email.value;
    const password = target.password.value;

    setErrorOpen(false);
    setError("");
    setLoading(true);

    try {
      await login(email, password);
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
      name="Login"
      errorOpen={errorOpen}
      error={error}
      loading={loading}
      fields={[
        {
          name: "email",
          type: "email",
          label: "Email Address",
          autoComplete: "email",
        },
        {
          name: "password",
          type: "password",
          label: "Password",
          autoComplete: "current-password",
        },
      ]}
      alternateLogins
      handleSubmit={handleSubmit}
      signupLink
      forgotPasswordLink
    ></ProfileComponent>
  );
}
