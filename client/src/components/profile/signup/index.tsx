import React, { useState } from "react";
import { useHistory } from "react-router-dom";
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

export default function SignupComponent(props: any) {
  const { signup } = useAuth();

  const [errorOpen, setErrorOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    } catch (err: any) {
      setErrorOpen(true);
      setError(`${err.response?.data || err}`);
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
