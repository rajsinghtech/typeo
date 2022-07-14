import React from "react";
import ReactGA from "react-ga";
import { useAuth } from "contexts/AuthContext";
import ProfileComponent from "components/profile/profile-component";
import { Grid } from "@mui/material";

export default function ForgotPassword() {
  React.useEffect(() => {
    ReactGA.event({
      category: "User",
      action: "Forgot Password Page Visited",
    });
  }, []);
  return (
    <Grid container spacing={3}>
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <ForgotPasswordComponent />
      </Grid>
      <Grid item xs={2}></Grid>
    </Grid>
  );
}

function ForgotPasswordComponent() {
  const { resetPassword } = useAuth();
  const [errorOpen, setErrorOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [messageOpen, setMessageOpen] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      email: { value: string };
    };

    const email = target.email.value;

    try {
      setMessage("");
      setMessageOpen(false);
      setErrorOpen(false);
      setError("");
      setLoading(true);
      await resetPassword(email);
      setMessageOpen(true);
      setMessage("Check your inbox for further instructions");
    } catch {
      setMessageOpen(false);
      setErrorOpen(true);
      setError("Failed to reset password");
    }

    setLoading(false);
  };

  return (
    <ProfileComponent
      name="Forgot Password"
      errorOpen={errorOpen}
      error={error}
      messageOpen={messageOpen}
      message={message}
      loading={loading}
      fields={[
        {
          name: "email",
          type: "email",
          label: "Email Address",
          autoComplete: "",
        },
      ]}
      handleSubmit={handleSubmit}
      signupLink
      loginLink
    ></ProfileComponent>
  );
}
