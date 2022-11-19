import React from "react";
import { useHistory } from "react-router-dom";
import { HomeProfile } from "pages/home/components/profile-display";
import { SettingsDialog } from "components/standard-game/settings";
import { useAuth } from "contexts/AuthContext";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonIcon from "@mui/icons-material/Person";
import { Box, IconButton, Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";

export default function Header() {
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const { isLoggedIn, logout } = useAuth();

  const history = useHistory();

  const OpenStats = () => {
    history.push("/stats");
  };

  const OpenUpdateProfile = () => {
    history.push("/update-profile");
  };

  const OpenSettings = () => {
    setSettingsOpen(true);
  };

  const Login = () => {
    history.push("/login");
  };

  const Logout = async () => {
    await logout();
    history.push("/");
    history.go(0);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
      <SettingsDialog open={settingsOpen} setOpen={setSettingsOpen} />
      <Box width="10%" justifyContent="flex-end" display="flex">
        <Tooltip title="Stats" placement="top">
          <IconButton onClick={OpenStats}>
            <BarChartIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <HomeProfile />
      <Box width="10%" display="flex">
        <Tooltip title={isLoggedIn ? "Logout" : "Login"} placement="top">
          {isLoggedIn ? (
            <IconButton onClick={Logout}>
              <LogoutIcon />
            </IconButton>
          ) : (
            <IconButton onClick={Login}>
              <LoginIcon />
            </IconButton>
          )}
        </Tooltip>
      </Box>
    </Box>
  );
}

export function HeaderMobile() {
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const { isLoggedIn, logout } = useAuth();

  const history = useHistory();

  const OpenStats = () => {
    history.push("/stats");
  };

  const OpenUpdateProfile = () => {
    history.push("/update-profile");
  };

  const OpenSettings = () => {
    setSettingsOpen(true);
  };

  const Login = () => {
    history.push("/login");
  };

  const Logout = async () => {
    await logout();
    history.push("/");
    history.go(0);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={1}
    >
      <SettingsDialog open={settingsOpen} setOpen={setSettingsOpen} />
      <Box display="flex">
        <Tooltip
          title="Stats"
          placement="top"
          sx={{ display: { xs: "none", vs: "inline-flex" } }}
        >
          <IconButton onClick={OpenStats}>
            <BarChartIcon />
          </IconButton>
        </Tooltip>
        <Tooltip
          title="Settings"
          placement="top"
          sx={{ display: { xs: "none", vs: "inline-flex" } }}
        >
          <IconButton onClick={OpenSettings}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip
          title="Profile"
          placement="top"
          sx={{ display: { xs: "none", vs: "inline-flex" } }}
        >
          <IconButton onClick={OpenUpdateProfile}>
            <PersonIcon />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={isLoggedIn ? "Logout" : "Login"}
          placement="top"
          sx={{ display: { xs: "none", vs: "inline-flex" } }}
        >
          {isLoggedIn ? (
            <IconButton onClick={Logout}>
              <LogoutIcon />
            </IconButton>
          ) : (
            <IconButton onClick={Login}>
              <LoginIcon />
            </IconButton>
          )}
        </Tooltip>
      </Box>
      <Box display={{ xs: "none", vs: "block" }}>
        <HomeProfile />
      </Box>
    </Box>
  );
}
