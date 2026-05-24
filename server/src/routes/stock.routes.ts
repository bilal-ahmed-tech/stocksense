import { Router } from "express";
import { search, getQuote, getChart, getNews } from "../controllers/stock.controller";

const router = Router();

router.get("/search", search);
router.get("/:symbol", getQuote);
router.get("/:symbol/chart", getChart);
router.get("/:symbol/news", getNews);

export default router;