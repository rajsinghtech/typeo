import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import GroupsIcon from "@mui/icons-material/Groups";
import HomeIcon from "@mui/icons-material/Home";
import BarChartIcon from "@mui/icons-material/BarChart";
import InsightsIcon from "@mui/icons-material/Insights";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import { Typography, Box, Divider, Button, Drawer } from "@mui/material";

export const drawerWidth = 260;
export const minimizedDrawerWidth = 100;

interface NavigationProps {
  children?: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const history = useHistory();

  const [open, setOpen] = React.useState<boolean>(false);

  const OpenHome = () => {
    history.push("/");
  };

  const FullDisplay = React.useMemo(() => {
    return (
      <Box>
        <DrawerDisplay open={open} setOpen={setOpen} />
        <Box display={{ xs: "block", md: "none" }}>
          <Box
            m={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button onClick={() => setOpen((prevOpen) => !prevOpen)}>
              <MenuIcon fontSize="large" />
            </Button>
            <Box sx={{ padding: 2, cursor: "pointer" }} onClick={OpenHome}>
              <img width="135px" height="36px" src={"/typeologo.png"} />
            </Box>
          </Box>
        </Box>

        <MiniDrawerMemo close={() => null}>{children}</MiniDrawerMemo>
      </Box>
    );
  }, [open]);

  return <>{FullDisplay}</>;
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
      <MiniDrawerMemo close={() => setOpen(false)} show />
    </Drawer>
  );
};

interface MiniDrawerProps {
  close: () => void;
  show?: boolean;
  children?: React.ReactNode;
}

const MiniDrawerMemo = React.memo(function MiniDrawer({
  close,
  show,
  children,
}: MiniDrawerProps) {
  const [minimized, setMinimized] = React.useState<boolean>(
    show
      ? false
      : JSON.parse(localStorage.getItem("typeo-minimized") || "false")
  );
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

  const Improve = () => {
    close();
    history.push("/improvement");
  };

  const Multiplayer = () => {
    close();
    history.push("/multiplayer");
  };

  const Stats = () => {
    close();
    history.push("/stats");
  };

  const UpdateProfile = () => {
    close();
    history.push("/update-profile");
  };

  const ToggleMinimize = () => {
    setMinimized((prev) => {
      localStorage.setItem("typeo-minimized", JSON.stringify(!prev));
      return !prev;
    });
  };

  return (
    <>
      <Box
        display={show ? "inherit" : { xs: "none", md: "inherit" }}
        sx={{
          position: "fixed",
          height: "100%",
          width: minimized ? minimizedDrawerWidth : drawerWidth,
          backgroundColor: "#242635",
          transition: "width 0.2s",
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          p={theme.spacing(3, 3, 1, 3)}
          height="100%"
        >
          {!show && (
            <Button
              color="secondary"
              sx={{
                minWidth: 0,
                alignSelf: minimized ? "center" : "flex-end",
                marginBottom: 2,
              }}
              onClick={ToggleMinimize}
            >
              <Box display="flex" gap={2} alignItems="center">
                {minimized ? (
                  <LastPageIcon />
                ) : (
                  <>
                    <Typography>{"Minimize"}</Typography>
                    <FirstPageIcon />
                  </>
                )}
              </Box>
            </Button>
          )}
          <Button
            sx={{ minWidth: 0 }}
            onClick={() => {
              const win = window.open(
                "https://discord.gg/eWkxwfDenv",
                "_blank"
              );
              if (win != null) {
                win.focus();
              }
            }}
            variant="contained"
          >
            <span
              className="iconify"
              style={{ fontSize: "20px", lineHeight: "28px" }}
              data-icon="mdi:discord"
            ></span>
            {!minimized && <>&nbsp; Join Our Discord</>}
          </Button>
          <Divider sx={{ my: theme.spacing(2) }} />

          <Box display="flex" flexDirection="column" gap={3}>
            <Typography variant={minimized ? "subtitle1" : "h6"} pt={7}>
              MENU
            </Typography>
            {[
              { name: "Home", path: "/", icon: <HomeIcon />, click: Home },
              {
                name: "Improve",
                path: "/improvement",
                icon: <InsightsIcon />,
                click: Improve,
              },
              {
                name: "Multiplayer (Disabled)",
                path: "/multiplayer",
                icon: <GroupsIcon />,
                click: Multiplayer,
              },
              {
                name: "Stats",
                path: "/stats",
                icon: <BarChartIcon />,
                click: Stats,
              },
              {
                name: "Update Profile",
                path: "/update-profile",
                icon: <PersonIcon />,
                click: UpdateProfile,
              },
            ].map((val) => {
              if (!isLoggedIn && val.name === "Update Profile") return null;
              let isActive =
                location.pathname.startsWith(val.path) && val.name !== "Home";
              if (location.pathname === "/" && val.name === "Home")
                isActive = true;
              return (
                <Button
                  key={val.name}
                  color="secondary"
                  sx={{
                    minWidth: 0,
                    padding: 1.5,
                    borderRadius: "10px",
                    textTransform: "none",
                    backgroundColor: isActive ? "background.default" : null,
                    color: isActive ? "primary.main" : null,
                    "& .MuiListItemIcon-root": {
                      color: isActive ? "primary.main" : null,
                    },
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
                  <Box
                    width="100%"
                    display="flex"
                    justifyContent={minimized ? "center" : "flex-start"}
                    alignItems="center"
                    gap={3}
                  >
                    {val.icon}
                    {!minimized && (
                      <Typography
                        fontSize={15}
                        alignSelf="flex-end"
                        textAlign="left"
                      >
                        {val.name}
                      </Typography>
                    )}
                  </Box>
                </Button>
              );
            })}
          </Box>
          <Box flexGrow={1} />
          <Divider />
          <Box
            onClick={isLoggedIn ? Logout : Login}
            sx={{
              minWidth: 0,
              padding: 1.5,
              marginY: 1,
              borderRadius: "10px",
              textTransform: "none",
              "&:hover, &:focus": {
                backgroundColor: "background.default",
                color: "primary.main",
                "& .MuiListItemIcon-root": {
                  color: "primary.main",
                },
              },
            }}
          >
            <Box
              width="100%"
              display="flex"
              justifyContent={minimized ? "center" : "flex-start"}
              alignItems="center"
              gap={3}
            >
              {isLoggedIn ? (
                <LogoutIcon fontSize="small" />
              ) : (
                <LoginIcon fontSize="small" />
              )}
              {!minimized && (
                <Typography>{isLoggedIn ? "Logout" : "Login"}</Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        paddingX={{ xs: 5, md: minimized ? 17 : 8 }}
        paddingY={5}
        marginLeft={{
          xs: 0,
          md: `${minimized ? minimizedDrawerWidth : drawerWidth}px`,
        }}
      >
        {children}
      </Box>
    </>
  );
});
