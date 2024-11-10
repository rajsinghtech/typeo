import React from "react";
import { useParams } from "react-router-dom";

export default function PrivateMatch() {
  const { matchId } = useParams<{ matchId: string }>();
  return (
    <div>
      <h1>Private Match</h1>
      {matchId}
    </div>
  );
}
