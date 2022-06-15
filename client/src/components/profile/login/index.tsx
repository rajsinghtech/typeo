import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useAuth } from "../../../contexts/AuthContext";
import ProfileComponent from "../ProfileComponent";

export default function LoginComponent() {
  const { login } = useAuth();
  const [errorOpen, setErrorOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    } catch (err: any) {
      setErrorOpen(true);
      setError(err.message);
      setLoading(false);
    }
  };

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
      handleSubmit={handleSubmit}
      signupLink
      forgotPasswordLink
    ></ProfileComponent>
  );
}
