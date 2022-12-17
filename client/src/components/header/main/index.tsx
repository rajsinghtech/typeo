import React from "react";
import { useHistory } from "react-router-dom";
import { useGameSettings } from "contexts/GameSettings";
import { SettingsDialog } from "components/standard-game/settings";
import { useAuth } from "contexts/AuthContext";
import { HomeProfile } from "../../profile-display";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Button,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";

export default function MainHeader() {
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const { isLoggedIn, logout } = useAuth();
  const { gameSettings, setGameSettings } = useGameSettings();
  const theme = useTheme();
  const history = useHistory();

  const mdScreenSize = useMediaQuery(theme.breakpoints.up("md"));

  const OpenSettings = () => {
    setSettingsOpen(true);
  };

  const OpenUpdateProfile = () => {
    history.push("/update-profile");
  };

  const Login = () => {
    history.push("/login");
  };

  const Logout = async () => {
    await logout();
    history.push("/");
    history.go(0);
  };

  const OpenHome = () => {
    history.push("/");
  };

  return (
    <>
      <SettingsDialog open={settingsOpen} setOpen={setSettingsOpen} />
      <Box display="flex" alignItems="flex-start">
        <Box
          flex={1}
          display="flex"
          justifyContent="center"
          alignItems="flex-start"
        >
          <Box
            sx={{
              marginRight: "auto",
              marginLeft: mdScreenSize ? 0 : "auto",
              paddingRight: 2,
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ cursor: "pointer" }} onClick={OpenHome}>
              <img width="135px" height="36px" src={"/typeologo.png"} />
            </Box>
          </Box>
        </Box>
        {mdScreenSize ? (
          <Box
            flex={1}
            display="flex"
            justifyContent="center"
            alignItems="flex-start"
          >
            <HomeProfile />
          </Box>
        ) : null}
        {mdScreenSize ? (
          <Box flex={1} display="flex" justifyContent="center">
            <Box
              display="flex"
              justifyContent="space-between"
              marginLeft="auto"
              gap={2}
            >
              <Tooltip title="Settings" placement="bottom">
                <Button
                  color="secondary"
                  sx={{
                    minWidth: "50px",
                    width: "50px",
                    height: "50px",
                    borderRadius: "10px",
                  }}
                  onClick={OpenSettings}
                >
                  <SettingsIcon />
                </Button>
              </Tooltip>
              <Tooltip disableHoverListener={isLoggedIn} title={"Login"}>
                <Button
                  variant="contained"
                  sx={{
                    minWidth: "52px",
                    width: "52px",
                    height: "52px",
                    borderRadius: "10px",
                  }}
                  onClick={() => {
                    if (isLoggedIn) {
                      OpenUpdateProfile();
                    } else {
                      Login();
                    }
                  }}
                >
                  {isLoggedIn ? <PersonIcon /> : <LoginIcon />}
                </Button>
              </Tooltip>
            </Box>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
