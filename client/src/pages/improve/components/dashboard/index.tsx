import React, { useState } from "react";
import { useGameSettings } from "contexts/GameSettings";
import { useStats } from "contexts/StatsContext";
import RaceHistory from "components/stats/race-history";
import MissedSequences from "components/stats/missed-sequences";
import StatKeyboard from "components/stats/stat-keyboard";
import {
  BaseStats,
  CharacterStatsHistory,
  CharacterStatsMap,
  DefaultImprovementStatFilters,
  SequenceData,
  Timeframes,
} from "constants/stats";
import { DefaultImproveGameSettings } from "constants/settings";
import StandardGame from "components/standard-game";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { Box, Typography, Button, Grid, Divider } from "@mui/material";
import useRank from "pages/improve/hooks/useRank";
import PracticeCategories from "./PracticeCategories";
import ImproveStats from "./ImproveStats";
import RankDisplay from "./RankDisplay";

interface DashboardProps {
  completed: number;
}

export default function Dashboard({ completed }: DashboardProps) {
  const { gameSettings } = useGameSettings();

  const [activeTest, setActiveTest] = useState<string>("");

  const {
    improvementRaces,
    getImprovementBaseStats,
    getImprovementKeyStatsMapWithHistory,
    getImprovementMissedSequences,
  } = useStats();

  const [baseStats, setBaseStats] = useState<BaseStats>({
    averages: { wpm: 0, accuracy: 0 },
    best: { wpm: 0, accuracy: 0 },
  });

  const rank = useRank(baseStats.averages.wpm, baseStats.averages.accuracy);

  const [characterData, setCharacterData] = useState<CharacterStatsMap>(
    new Map()
  );
  const [characterDataHistory, setCharacterDataHistory] =
    useState<CharacterStatsHistory[]>();
  const [sequenceData, setSequenceData] = useState<SequenceData>({});

  React.useEffect(() => {
    const baseStats = getImprovementBaseStats(DefaultImprovementStatFilters);
    const characterDataWithHistory = getImprovementKeyStatsMapWithHistory({
      ...DefaultImprovementStatFilters,
      timeframe: Timeframes.LAST_100,
    });
    const sequenceData = getImprovementMissedSequences({
      ...DefaultImprovementStatFilters,
      timeframe: Timeframes.LAST_100,
    });
    setBaseStats(baseStats);
    setCharacterData(characterDataWithHistory.stats);
    setCharacterDataHistory(characterDataWithHistory.history);
    setSequenceData(sequenceData);
  }, [improvementRaces]);

  const StandardGameDisplay = React.useMemo(
    () => (
      <StandardGame
        settings={{
          ...DefaultImproveGameSettings,
          gameInfo: {
            ...DefaultImproveGameSettings.gameInfo,
            practice: {
              isPractice: activeTest !== "main",
              practiceStrings: activeTest.split("-"),
            },
          },
          display: {
            ...gameSettings.display,
            showProfile: false,
          },
          improvementCategory: activeTest,
        }}
      />
    ),
    [activeTest, gameSettings]
  );

  if (activeTest === "") {
    return (
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <RankDisplay rank={rank} setActiveTest={setActiveTest} />
        </Grid>
        <Grid item xs={9}>
          <ImproveStats baseStats={baseStats} />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" alignItems="flex-end" gap={3}>
            <Typography variant="h4">PRACTICE CATEGORIES</Typography>
            <Typography variant="subtitle1" color="text.secondary" flexGrow={1}>
              {"These won't influence your overall rank"}
            </Typography>
            <Button
              variant="contained"
              onClick={
                () => null
                // setCategoryTests(
                //   generateCategories(characterData, sequenceData)
                // )
              }
            >
              Re-Generate Categories
            </Button>
          </Box>
          <Divider sx={{ mt: 1, mb: 3 }} />
          <PracticeCategories setActiveTest={setActiveTest} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h4">STATS</Typography>
          <Divider sx={{ mt: 1 }} />
        </Grid>
        <Grid item xs={6}>
          <MissedSequences
            missedSequences={sequenceData}
            timeframe={Timeframes.LAST_100}
          />
        </Grid>
        <Grid item xs={6}>
          <StatKeyboard
            title="Key Stats"
            data={characterData}
            history={characterDataHistory}
            timeframe={Timeframes.LAST_100}
          />
        </Grid>
        <Grid item xs={12}>
          <RaceHistory
            races={improvementRaces}
            statFilters={{
              ...DefaultImprovementStatFilters,
              timeframe: Timeframes.LAST_100,
            }}
          />
        </Grid>
      </Grid>
    );
  }

  return (
    <>
      <Typography>{activeTest}</Typography>
      <Button
        sx={{ marginBottom: 2 }}
        variant="outlined"
        onClick={() => setActiveTest("")}
        startIcon={<KeyboardBackspaceIcon />}
      >
        Back
      </Button>
      <Box display="flex" gap={5}>
        {StandardGameDisplay}
      </Box>
    </>
  );
}
