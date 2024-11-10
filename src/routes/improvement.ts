import express from "express";
import { verifyIDToken } from "../auth/authenticateToken";
import { getImprovementCategories } from "../db/improvement";
const router = express.Router();

router.get(`/categories`, async (req: any, res, next) => {
  const { uid } = req["current-user"];

  const categories = await getImprovementCategories(uid);

  res.status(200).json({ categories });
});

export default router;
