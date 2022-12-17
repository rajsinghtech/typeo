import React from "react";
import { useAuth } from "contexts/AuthContext";
import { Timeframes } from "constants/stats";

import { db } from "config/firebase";
import {
  query,
  collection,
  limit,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

import AboutImprovement from "./components/about-improvement";
import PlacementTests from "./components/placement-tests";
import Dashboard from "./components/dashboard";

import { Box } from "@mui/material";

export default function Improve() {
  const [activeComponent, setActiveComponent] = React.useState<number>(0);
  const [racesCompleted, setRacesCompleted] = React.useState<number>(0);

  const { currentUser } = useAuth();

  React.useEffect(() => {
    let isMounted = true;

    const q = query(
      collection(db, "users", currentUser.uid, "improvement_races"),
      limit(Timeframes.LAST_100),
      orderBy("timestamp", "desc")
    );
    onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      if (!isMounted) return;
      console.log(snapshot.size);
      setRacesCompleted(snapshot.size);
      if (snapshot.size >= 10) {
        setActiveComponent(2);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const components = [
    <AboutImprovement
      key="about_improvement"
      onStartButtonPress={() => setActiveComponent(1)}
    />,
    <PlacementTests
      key="placement_tests"
      completed={racesCompleted}
      onDashboardPress={() => setActiveComponent(0)}
    />,
    <Dashboard key="customized_tests" completed={racesCompleted} />,
  ];

  return <Box>{components[activeComponent]}</Box>;
}
