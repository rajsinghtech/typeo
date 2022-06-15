import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import ProfileComponent from "../ProfileComponent";

export default function ForgotPasswordComponent() {
  const { resetPassword } = useAuth();
  const [errorOpen, setErrorOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageOpen, setMessageOpen] = useState(false);

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
