import React from "react";
import AboutImprovement from "./components/about-improvement";
import PlacementTests from "./components/placement-tests";
import Dashboard from "./components/dashboard";
import { useStats } from "contexts/StatsContext";
import { Box, CircularProgress } from "@mui/material";

export default function Improve() {
  const [activeComponent, setActiveComponent] = React.useState<number>(0);

  const { improvementRaces } = useStats();

  React.useEffect(() => {
    if (improvementRaces.length >= 10) {
      setActiveComponent(2);
    } else if (improvementRaces.length > 0) {
      setActiveComponent(1);
    } else {
      setActiveComponent(0);
    }
  }, [improvementRaces]);

  const components = [
    <AboutImprovement
      key="about_improvement"
      onStartButtonPress={() => setActiveComponent(1)}
    />,
    <PlacementTests
      key="placement_tests"
      completed={improvementRaces.length}
      onDashboardPress={() => setActiveComponent(0)}
    />,
    <Dashboard key="customized_tests" completed={improvementRaces.length} />,
  ];

  return <Box>{components[activeComponent]}</Box>;
}
