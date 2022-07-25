import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import GroupsIcon from "@mui/icons-material/Groups";
import HomeIcon from "@mui/icons-material/Home";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Typography,
  List,
  Box,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Drawer,
  useMediaQuery,
} from "@mui/material";

interface NavigationProps {
  children?: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const [open, setOpen] = React.useState<boolean>(false);
  const theme = useTheme();

  const vsScreenSize = useMediaQuery(theme.breakpoints.up("vs"));
  const smScreenSize = useMediaQuery(theme.breakpoints.up("sm"));
  const mdScreenSize = useMediaQuery(theme.breakpoints.up("md"));
  const lgScreenSize = useMediaQuery(theme.breakpoints.up("lg"));
  const xlScreenSize = useMediaQuery(theme.breakpoints.up("xl"));

  let screenSize = "xs";

  if (xlScreenSize) screenSize = "xl";
  else if (lgScreenSize) screenSize = "lg";
  else if (mdScreenSize) screenSize = "md";
  else if (smScreenSize) screenSize = "sm";
  else if (vsScreenSize) screenSize = "vs";

  const FullDisplay = React.useMemo(() => {
    return (
      <Box display={{ xs: "none", md: "inherit" }}>
        <MiniDrawer>{children}</MiniDrawer>
      </Box>
    );
  }, []);

  const DrawerToggle = React.useMemo(() => {
    return (
      <Box display={{ xs: "block", md: "none" }}>
        <Box
          position="fixed"
          display="flex"
          alignItems="center"
          top={20}
          left={20}
          zIndex={999}
        >
          <Button onClick={() => setOpen((prevOpen) => !prevOpen)}>
            <MenuIcon fontSize="large" />
          </Button>
          <LogoDisplay />
        </Box>
        <Box p={5} pt={{ xs: 10, md: 0 }}>
          {children}
        </Box>
      </Box>
    );
  }, []);

  return (
    <>
      {/* <Box position="absolute" zIndex={9999} top={20} left={20}>
        <Typography variant="h1">{screenSize}</Typography>
      </Box> */}
      {FullDisplay}
      {DrawerToggle}
      <DrawerDisplay open={open} setOpen={setOpen} />
    </>
  );
}

const DrawerDisplay = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<boolean>;
}) => {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <MiniDrawer />
    </Drawer>
  );
};

const drawerWidth = 260;

function MiniDrawer({ children }: NavigationProps) {
  const theme = useTheme();
  const { isLoggedIn, logout } = useAuth();
  const history = useHistory();
  const location = useLocation();

  const Login = () => {
    history.push("/login");
  };

  const Logout = async () => {
    await logout();
    history.push("/");
    history.go(0);
  };

  const Home = () => {
    history.push("/");
  };

  const FindMatch = () => {
    if (location.pathname === "/online") history.go(0);
    else history.push("/online");
  };

  const Stats = () => {
    history.push("/stats");
  };

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          height: "100%",
          width: drawerWidth,
          backgroundColor: "#242635",
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          p={theme.spacing(3, 3, 1, 3)}
          height="100%"
        >
          <LogoDisplay />
          <Divider sx={{ my: theme.spacing(2) }} />
          <Button variant="contained">
            <span
              className="iconify"
              style={{ fontSize: "20px", lineHeight: "28px" }}
              data-icon="mdi:discord"
            ></span>
            &nbsp; Join Our Discord
          </Button>
          <Typography variant="h6" pt={7}>
            MENU
          </Typography>
          <List>
            {[
              { name: "Home", icon: <HomeIcon />, click: Home },
              {
                name: "Find Match",
                icon: <GroupsIcon />,
                click: FindMatch,
              },
              {
                name: "Stats",
                icon: <BarChartIcon />,
                click: Stats,
              },
            ].map((val) => (
              <ListItem
                key={val.name}
                button
                sx={{
                  paddingX: theme.spacing(1),
                  marginY: theme.spacing(2),
                  borderRadius: "10px",
                  "&:hover, &:focus": {
                    backgroundColor: "background.default",
                    color: "primary.main",
                    "& .MuiListItemIcon-root": {
                      color: "primary.main",
                    },
                  },
                }}
                onClick={
                  ["Friends", "Inbox", "Find Online Match"].includes(val.name)
                    ? () => {
                        null;
                      }
                    : val.click
                }
              >
                <ListItemIcon>{val.icon}</ListItemIcon>
                <ListItemText
                  primary={val.name}
                  primaryTypographyProps={{ fontSize: 15 }}
                />
              </ListItem>
            ))}
          </List>
          <Box flexGrow={1} />
          <Divider />
          <List>
            <ListItem
              button
              onClick={isLoggedIn ? Logout : Login}
              sx={{
                paddingX: theme.spacing(1),
                borderRadius: "10px",
                "&:hover, &:focus": {
                  backgroundColor: "background.default",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": {
                    color: "primary.main",
                  },
                },
              }}
            >
              <ListItemIcon>
                {isLoggedIn ? (
                  <LogoutIcon fontSize="small" />
                ) : (
                  <LoginIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText primary={isLoggedIn ? "Logout" : "Login"} />
            </ListItem>
          </List>
        </Box>
      </Box>
      <Box p={5} marginLeft={`${drawerWidth}px`}>
        {children}
      </Box>
    </>
  );
}

const LogoDisplay = () => {
  const history = useHistory();

  const OpenHome = () => {
    history.push("/");
  };

  return (
    <Box sx={{ cursor: "pointer" }} onClick={OpenHome}>
      <img width="135px" height="36px" src="public/typeologo.png" />
    </Box>
  );
};
