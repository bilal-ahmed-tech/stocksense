import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getPortfolio, buy, sell, getHistory, getPerformance } from "../controllers/portfolio.controller";

const router = Router();

router.use(requireAuth);

router.get("/", getPortfolio);
router.post("/buy", buy);
router.post("/sell", sell);
router.get("/history", getHistory);
router.get("/performance", getPerformance);
export default router;