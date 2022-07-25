import { RaceSchema } from "../constants/schemas/race";
import { db } from "../config/firestore";
import { FieldValue } from "firebase-admin/firestore";
import sizeof from "firestore-size";

export const saveRaceStats = async (uid: string, raceData: RaceSchema) => {
  const userRaceCollectionDoc = db.collection(`users/${uid}/races`).doc();
  userRaceCollectionDoc.set({
    ...raceData,
    timestamp: FieldValue.serverTimestamp(),
  });
};

// export const changeAllRaces = async () => {
//   const users = await db
//     .collection("users/Zi1dA18hkgNTDdZA6WLxLOjUcqc2/races")
//     .limit(50)
//     .get();
//   console.log(
//     users.docs.map((doc) => {
//       const data = doc.data();
//       const passage = data.passage;
//       const dataPoints = data.characterDataPoints;
//       const bytes = sizeof(dataPoints || 0);

//       return { dataPoints, bytes };
//     })
//   );

//   // const userIDs = users.docs.map((doc) => doc.data());
//   // console.log(userIDs);
// };

// const getTextType = (passage: string): number => {
//   return 0;
// };
