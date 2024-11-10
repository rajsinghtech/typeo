import { Category } from "../constants/improvement";
import { db } from "../config/firestore";

export const getImprovementCategories = async (
  uid: string
): Promise<Category[]> => {
  const userDocument = db.doc(`/users/${uid}`);
  const userImprovementCategories = await userDocument.get();

  return userImprovementCategories.data()?.improvement_categories || [];
};
