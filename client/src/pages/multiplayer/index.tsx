import React /*, { useState}*/ from "react";
import ReactGA from "react-ga";
import { useHistory } from "react-router-dom";
// import { useHistory } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import GroupsIcon from "@mui/icons-material/Groups";
import { Box, Button, Typography } from "@mui/material";

export default function Multiplayer() {
  const history = useHistory();

  React.useEffect(() => {
    ReactGA.event({
      category: "User",
      action: "Online Page Visited",
    });
  }, []);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
      <Typography variant="h2" color="primary.main">
        Multiplayer
      </Typography>
      <Typography variant="subtitle1">
        Compete against others in an online race of up to 5 players
      </Typography>
      <Box display="flex" justifyContent="center" gap={5} mt="10vh">
        <MatchButton
          title="Matchmaking FFA"
          icon={<TravelExploreIcon sx={{ fontSize: "4em" }} />}
          onClick={() => history.push("/multiplayer/ffa")}
        />
        <MatchButton
          title="Create Private Match"
          icon={<GroupsIcon sx={{ fontSize: "4em" }} />}
          onClick={() => history.push("/multiplayer/private/1234")}
        />
      </Box>
    </Box>
  );
}

interface MatchButtonProps {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const MatchButton = ({ title, icon, onClick }: MatchButtonProps) => {
  return (
    <Button
      variant="outlined"
      color="secondary"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 3,
        width: "17em",
        height: "17em",
      }}
      onClick={onClick}
    >
      {icon}
      <Typography variant="h5">{title}</Typography>
    </Button>
  );
};
