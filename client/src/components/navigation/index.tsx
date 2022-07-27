import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "./typeologo.png";
import { useAuth } from "contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import GroupsIcon from "@mui/icons-material/Groups";
import HomeIcon from "@mui/icons-material/Home";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
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
} from "@mui/material";

interface NavigationProps {
  children?: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const FullDisplay = React.useMemo(() => {
    return (
      <Box display={{ xs: "none", md: "inherit" }}>
        <MiniDrawer close={() => null}>{children}</MiniDrawer>
      </Box>
    );
  }, []);

  return (
    <>
      {FullDisplay}
      <DrawerToggle>{children}</DrawerToggle>
    </>
  );
}

const DrawerToggle = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const history = useHistory();

  const OpenHome = () => {
    history.push("/");
  };

  return (
    <>
      <DrawerDisplay open={open} setOpen={setOpen} />
      <Box display={{ xs: "block", md: "none" }}>
        <Box
          m={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box sx={{ cursor: "pointer" }} onClick={OpenHome}>
            <img width="135px" height="36px" src={logo} />
          </Box>
          <Button onClick={() => setOpen((prevOpen) => !prevOpen)}>
            <MenuIcon fontSize="large" />
          </Button>
        </Box>
        {React.useMemo(() => {
          return (
            <Box p={5} pt={0}>
              {children}
            </Box>
          );
        }, [])}
      </Box>
    </>
  );
};

const DrawerDisplay = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<boolean>;
}) => {
  return (
    <Drawer
      anchor="right"
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
      <MiniDrawer close={() => setOpen(false)} />
    </Drawer>
  );
};

const drawerWidth = 260;

interface MiniDrawerProps {
  close: () => void;
  children?: React.ReactNode;
}

function MiniDrawer({ close, children }: MiniDrawerProps) {
  const theme = useTheme();
  const { isLoggedIn, logout } = useAuth();
  const history = useHistory();
  const location = useLocation();

  const Login = () => {
    close();
    history.push("/login");
  };

  const Logout = async () => {
    await logout();
    history.push("/");
    history.go(0);
  };

  const Home = () => {
    close();
    history.push("/");
  };

  const FindMatch = () => {
    close();
    if (location.pathname === "/online") history.go(0);
    else history.push("/online");
  };

  const Stats = () => {
    close();
    history.push("/stats");
  };

  const UpdateProfile = () => {
    close();
    history.push("/update-profile");
  };

  const OpenHome = () => {
    close();
    history.push("/");
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
          <Box sx={{ cursor: "pointer" }} onClick={OpenHome}>
            <img width="135px" height="36px" src={logo} />
          </Box>
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
                name: "Muliplayer (Disabled)",
                icon: <GroupsIcon />,
                click: FindMatch,
              },
              {
                name: "Stats",
                icon: <BarChartIcon />,
                click: Stats,
              },
              {
                name: "Update Profile",
                icon: <PersonIcon />,
                click: UpdateProfile,
              },
            ].map((val) => {
              if (!isLoggedIn && val.name === "Update Profile") return null;
              return (
                <ListItem
                  key={val.name}
                  disabled={val.name === "Muliplayer (Disabled)"}
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
              );
            })}
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
