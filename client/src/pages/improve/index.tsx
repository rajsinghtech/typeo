import React from "react";
import { useAuth } from "contexts/AuthContext";
import AboutImprovement from "./components/about-improvement";
import PlacementTests from "./components/placement-tests";
import Dashboard from "./components/dashboard";
import { useStats } from "contexts/StatsContext";
import { Box } from "@mui/material";

export default function Improve() {
  const [activeComponent, setActiveComponent] = React.useState<number>(0);

  const { currentUser } = useAuth();

  const { improvementRaces } = useStats();

  React.useEffect(() => {
    if (improvementRaces.length >= 10) {
      setActiveComponent(2);
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
