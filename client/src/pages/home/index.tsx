import React, { useState } from "react";
import ReactGA from "react-ga";
import SoloGame from "pages/home/components/solo-game";
import Header from "pages/home/components/header/quick";
import LeaderboardComponent from "components/leaderboard";
import { getLeaderboards } from "api/rest/leaderboard";
import Grid from "@mui/material/Grid";
import { Divider } from "@mui/material";

export default function Home() {
  const [dailyLeaderboard, setDailyLeaderboard] = useState<
    { place: number; name: string; accuracy: number; wpm: number }[]
  >([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<
    { place: number; name: string; accuracy: number; wpm: number }[]
  >([]);

  React.useEffect(() => {
    let isMounted = true;
    getLeaderboards().then(({ daily, allTime }) => {
      if (isMounted) {
        setDailyLeaderboard(
          daily.map((entry, index) => ({
            place: index + 1,
            name: entry.name,
            accuracy: entry.accuracy,
            wpm: entry.wpm,
          }))
        );
        setAllTimeLeaderboard(
          allTime.map((entry, index) => ({
            place: index + 1,
            name: entry.name,
            accuracy: entry.accuracy,
            wpm: entry.wpm,
          }))
        );
      }
    });

    ReactGA.event({
      category: "User",
      action: "Home Page Visited",
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Grid container spacing={3}>
        {/* <Grid item xs={1.5}>
          <Box marginTop={12}>
            <HomeProfile />
          </Box>
        </Grid> */}
        <Grid item xs={12}>
          <SoloGame />
        </Grid>
        {/* <Grid item xs={1.5}>
          <Button onClick={logout}>Logout</Button>
        <Button
          onClick={() => {
            UserAPI.sendFriendRequest(
              currentUser,
              "Xp7BBf4GidPtZoDuuFPqC6bo6s73"
            )
              .then((result) => {
                //console.log(result);
              })
              .catch((err) => {
                console.log(err.response?.data);
              });
          }}
        >
          Get Players
        </Button>
        </Grid> */}
      </Grid>
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} sm={6}>
          <LeaderboardComponent title="Daily" players={dailyLeaderboard} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <LeaderboardComponent title="All Time" players={allTimeLeaderboard} />
        </Grid>
      </Grid>
    </>
  );
}
