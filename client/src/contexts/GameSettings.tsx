import React, { useContext, useState } from "react";
import {
  GameSettings,
  DefaultGameSettings,
  GameTypes,
  TextTypes,
} from "../constants/settings";

interface ContextGameSettings {
  gameSettings: GameSettings;
  setGameSettings: (v: GameSettings) => void;
}

const GameSettingsContext = React.createContext<ContextGameSettings>({
  gameSettings: DefaultGameSettings,
  setGameSettings: () => {
    null;
  },
});

export function useGameSettings(): ContextGameSettings {
  return useContext(GameSettingsContext);
}

interface ProviderProps {
  children: any;
}

export function GameSettingsProvider({ children }: ProviderProps) {
  const [gameSettings, setGameSettings] = useState<GameSettings>(
    getStoredGameSettings()
  );

  React.useEffect(() => {
    localStorage.setItem("typeo_game_settings", JSON.stringify(gameSettings));
  }, [gameSettings]);

  const value = {
    gameSettings,
    setGameSettings,
  };

  return (
    <GameSettingsContext.Provider value={value}>
      {children}
    </GameSettingsContext.Provider>
  );
}

const getStoredGameSettings = () => {
  const storedSettings = localStorage.getItem("typeo_game_settings");
  if (storedSettings) {
    const parsedSettings = JSON.parse(storedSettings);
    if (!parsedSettings.display) {
      parsedSettings.display = { ...DefaultGameSettings.display };
    }
    return parsedSettings;
  }
  return DefaultGameSettings;
};
