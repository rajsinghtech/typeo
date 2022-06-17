import { FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";
import React from "react";
import { useGameSettings } from "../../../../contexts/GameSettings";

export default function TopSettings() {
  const { gameSettings, setGameSettings } = useGameSettings();

  const OnStrictChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setGameSettings({
      ...gameSettings,
      gameInfo: { ...gameSettings.gameInfo, strict: value },
    });
  };

  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Switch
            checked={gameSettings.gameInfo.strict}
            onChange={OnStrictChange}
          />
        }
        label={<Typography>Strict</Typography>}
        labelPlacement="end"
      />
    </FormGroup>
  );
}
