import React from "react";
import { useHistory } from "react-router-dom";
import { HomeProfile } from "pages/home/components/profile-display";
import { SettingsDialog } from "components/standard-game/settings";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonIcon from "@mui/icons-material/Person";
import { Box, IconButton, Tooltip } from "@mui/material";

export default function Header() {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
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

  return (
    <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
      <SettingsDialog open={settingsOpen} setOpen={setSettingsOpen} />
      <Box
        width="10%"
        display={{ xs: "none", md: "flex" }}
        justifyContent="flex-end"
      >
        <Tooltip title="Stats" placement="top">
          <IconButton onClick={OpenStats}>
            <BarChartIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Profile" placement="top">
          <IconButton onClick={OpenUpdateProfile}>
            <PersonIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <HomeProfile />
      <Box width="10%" display={{ xs: "none", md: "block" }}>
        <Tooltip title="Test Settings" placement="top">
          <IconButton onClick={OpenSettings}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
