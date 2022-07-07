import React, { useState } from "react";
import ReactGA from "react-ga";
import Grid from "@mui/material/Grid";
import SoloGame from "../../components/game/types/SoloGame";
import LeaderboardComponent from "../../components/leaderboard/Leaderboard";
import { getLeaderboards } from "../../api/rest/leaderboard";


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
          <Grid container spacing={3}>
            <SoloGame />
          </Grid>
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
      <Grid container spacing={3} mt={15}>
        <Grid item xs={1}></Grid>
        <Grid item xl={4} lg={5} xs={10}>
          <LeaderboardComponent title="Daily" players={dailyLeaderboard} />
        </Grid>
        <Grid
          item
          xl={2}
          xs={1}
          display={{ lg: "none", xl: "inline-block" }}
        ></Grid>
        <Grid item xs={1} display={{ xs: "inline-block", lg: "none" }}></Grid>
        <Grid item xl={4} lg={5} xs={10}>
          <LeaderboardComponent title="All Time" players={allTimeLeaderboard} />
        </Grid>
      </Grid>
    </>
  );
}
