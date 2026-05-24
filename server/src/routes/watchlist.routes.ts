import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  getWatchlist,
  addSymbol,
  removeSymbol,
} from "../controllers/watchlist.controller";

const router = Router();

router.use(requireAuth);

router.get("/", getWatchlist);
router.post("/:symbol", addSymbol);
router.delete("/:symbol", removeSymbol);

export default router;