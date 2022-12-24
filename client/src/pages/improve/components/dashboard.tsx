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
  RaceStats,
  SequenceData,
  Timeframes,
} from "constants/stats";
import { DefaultImproveGameSettings } from "constants/settings";
import { GridCard } from "components/common";
import StandardGame from "components/standard-game";
import {
  calculateAccuracyColor,
  calculateWPMColor,
  clamp,
  LinearProgressWithLabel,
} from "components/standard-game/feedback/speed-progress";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import { Box, Typography, Button, Grid, Divider } from "@mui/material";

interface DashboardProps {
  completed: number;
}

export default function Dashboard({ completed }: DashboardProps) {
  const { gameSettings } = useGameSettings();

  const [tests] = useState<number[]>([1, 2, 3, 4, 5]);
  const [activeTest, setActiveTest] = useState<number>(0);

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
  const [characterData, setCharacterData] = useState<CharacterStatsMap>(
    new Map()
  );
  const [characterDataHistory, setCharacterDataHistory] =
    useState<CharacterStatsHistory[]>();
  const [sequenceData, setSequenceData] = useState<SequenceData>({});

  const rankIndex = getRankIndex(
    baseStats.averages.wpm,
    baseStats.averages.accuracy
  );
  const accuracyForNextRank = getAccuracyForNextRank(
    baseStats.averages.wpm,
    baseStats.averages.accuracy
  );

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

  if (activeTest === 0) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <GridCard
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pb: 3,
              gap: 3,
            }}
          >
            <img
              src={RANK_ICONS[rankIndex]}
              alt="Bronze1"
              width="170px"
              height="170px"
            />
            <Typography variant="h4" color={RANK_COLORS[rankIndex]}>
              {RANK_NAMES[rankIndex]}
            </Typography>
            <Typography mt={-2}>{"(Last 25 Tests)"}</Typography>
          </GridCard>
        </Grid>
        <Grid item xs={9}>
          <GridCard
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Box textAlign="center" flex={1}>
              <Typography
                variant="h6"
                color="warning.main"
              >{`Rank Progress`}</Typography>
              <Box display="flex" justifyContent="center" gap={2} pb={2}>
                {rankIndex !== 0 ? (
                  <img
                    src={RANK_ICONS[rankIndex - 1]}
                    alt={RANK_NAMES[rankIndex - 1]}
                    width="25px"
                    height="25px"
                  />
                ) : (
                  <NotInterestedIcon color="error" />
                )}
                <Box width="75%">
                  <LinearProgressWithLabel
                    value={
                      rankIndex === RANK_NAMES.length - 1
                        ? 100
                        : getRankProgress(
                            baseStats.averages.wpm,
                            baseStats.averages.accuracy
                          ) * 100
                    }
                    step={5}
                    fillColor={"warning.main"}
                  />
                </Box>
                {rankIndex !== RANK_NAMES.length - 1 ? (
                  <img
                    src={RANK_ICONS[rankIndex + 1]}
                    alt={RANK_NAMES[rankIndex + 1]}
                    width="25px"
                    height="25px"
                  />
                ) : (
                  <NotInterestedIcon color="error" />
                )}
              </Box>
              {rankIndex !== RANK_NAMES.length - 1 && (
                <>
                  <Typography>{`(WPM required ${getWpmForNextRank(
                    baseStats.averages.wpm,
                    baseStats.averages.accuracy
                  ).toFixed(1)})`}</Typography>
                  {accuracyForNextRank <= 100 && (
                    <>
                      <Typography>
                        {`(Accuracy required ${accuracyForNextRank.toFixed(
                          1
                        )})`}
                      </Typography>
                    </>
                  )}
                </>
              )}
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              flex={1}
            >
              <Box width="75%" textAlign="center">
                <Typography variant="h6" color="secondary">{`WPM`}</Typography>
                <Typography
                  variant="h6"
                  color={calculateWPMColor(baseStats.averages.wpm, 1)}
                >{`${baseStats.averages.wpm.toFixed(1)}`}</Typography>
                <LinearProgressWithLabel
                  value={(baseStats.averages.wpm / 170) * 100}
                  step={5}
                  fillColor={calculateWPMColor(baseStats.averages.wpm, 1)}
                />
              </Box>
              <Box width="75%" textAlign="center">
                <Typography
                  variant="h6"
                  color="secondary"
                >{`Accuracy`}</Typography>
                <Typography
                  variant="h6"
                  color={calculateAccuracyColor(baseStats.averages.accuracy, 1)}
                >{`${baseStats.averages.accuracy.toFixed(1)}%`}</Typography>
                <LinearProgressWithLabel
                  value={
                    (Math.max(baseStats.averages.accuracy - 85, 0) / 15) * 100
                  }
                  step={5}
                  fillColor={calculateAccuracyColor(
                    baseStats.averages.accuracy,
                    1
                  )}
                />
              </Box>
            </Box>
          </GridCard>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h3">Practice Categories</Typography>
          <Divider sx={{ mt: 1, mb: 3 }} />
          <Box display="flex" justifyContent="flex-start" gap={2}>
            {tests.map((item) => (
              <CustomizedTest
                key={item}
                id={item}
                wpm={Math.random() * 90 + 80}
                accuracy={Math.random() * 15 + 85}
                setActiveTest={setActiveTest}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h3">Stats</Typography>
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
      <Button
        sx={{ marginBottom: 2 }}
        variant="outlined"
        onClick={() => setActiveTest(0)}
        startIcon={<KeyboardBackspaceIcon />}
      >
        Back
      </Button>
      <Box display="flex" gap={5}>
        <StandardGame
          settings={{
            ...DefaultImproveGameSettings,
            display: {
              ...gameSettings.display,
              showProfile: false,
            },
          }}
        />
      </Box>
    </>
  );
}

interface CustomizedTestProps {
  id: number;
  wpm: number;
  accuracy: number;
  setActiveTest: (id: number) => void;
}

export function CustomizedTest({
  id,
  wpm,
  accuracy,
  setActiveTest,
}: CustomizedTestProps) {
  const rankIndex = getRankIndex(wpm, accuracy);
  return (
    <GridCard textalign="center" sx={{ minWidth: "225px" }}>
      <Box display="flex" flexDirection="column" gap={1} alignItems="center">
        <Typography fontSize="xs">Lorem ipsum.</Typography>

        <Box display="flex" gap={1}>
          <Typography fontSize="xs">WPM:</Typography>
          <Typography fontSize="xs" color={calculateWPMColor(wpm, 1)}>
            {wpm.toFixed(1)}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Typography fontSize="xs">Accuracy:</Typography>
          <Typography fontSize="xs" color={calculateAccuracyColor(accuracy, 1)}>
            {accuracy.toFixed(1)}
          </Typography>
        </Box>
        <img
          src={RANK_ICONS[rankIndex]}
          alt={RANK_NAMES[rankIndex]}
          width="75px"
          height="75px"
        />

        <Button
          variant="contained"
          sx={{ mt: 1 }}
          onClick={() => setActiveTest(id)}
        >
          Train
        </Button>
      </Box>
    </GridCard>
  );
}

const RANK_NAMES = [
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
];

const RANK_COLORS = [
  "#CD7F32",
  "#C0C0C0",
  "#FFD700",
  "#00FFFF",
  "#00BFFF",
  "#663A82",
  "#c4e3d1",
];

const RANK_ICONS = [
  "Bronze1.png",
  "Silver1.png",
  "Gold1.png",
  "Platinum1.png",
  "Diamond1.png",
  "Master1.png",
  "Grandmaster1.png",
];

const getRankScore = (wpm: number, accuracy: number) => {
  const rankScore =
    (clamp(wpm, 0, 170) + 27) ** 2.5 / 170 ** 2.611 +
    (clamp(accuracy, 85, 100) - 72) ** 2.7 / 15 ** 3.95;
  return clamp(rankScore, 0, 1);
};

const getRankIndex = (wpm: number, accuracy: number) => {
  const rankScore = getRankScore(wpm, accuracy);

  return clamp(Math.floor(rankScore / (1 / 7)), 0, RANK_NAMES.length - 1);
};

const getRankProgress = (wpm: number, accuracy: number) => {
  const rankScore = getRankScore(wpm, accuracy);

  return (rankScore % (1 / 7)) / (1 / 7);
};

const getWpmForNextRank = (wpm: number, accuracy: number) => {
  const rankScore = getRankScore(wpm, accuracy);
  const scoreForNextRank =
    rankScore + (1 - getRankProgress(wpm, accuracy)) * (1 / 7);

  return (
    Math.pow(
      (scoreForNextRank - (clamp(accuracy, 85, 100) - 72) ** 2.7 / 15 ** 3.95) *
        170 ** 2.611,
      1 / 2.5
    ) - 27
  );
};

const getAccuracyForNextRank = (wpm: number, accuracy: number) => {
  const rankScore = getRankScore(wpm, accuracy);
  const scoreForNextRank =
    rankScore + (1 - getRankProgress(wpm, accuracy)) * (1 / 7);

  return (
    Math.pow(
      (scoreForNextRank - (clamp(wpm, 0, 170) + 27) ** 2.5 / 170 ** 2.611) *
        15 ** 3.95,
      1 / 2.7
    ) + 72
  );
};

// x = rank +
