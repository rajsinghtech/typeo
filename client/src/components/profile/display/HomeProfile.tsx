import { Typography } from "@mui/material";
import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { GridCard } from "../../common";

export default function HomeProfile() {
  const { currentUser, isLoggedIn } = useAuth();
  return (
    <GridCard accent>
      <Typography>{currentUser.displayName}</Typography>
    </GridCard>
  );
}
