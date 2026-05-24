import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateMe,
  changePassword,
  resetBalance,
  deleteMe,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { authRateLimit, refreshRateLimit } from "../middleware/rateLimit";

const router = Router();

router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, login);
router.post("/refresh", refreshRateLimit, refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, updateMe);
router.patch("/me/password", requireAuth, changePassword);
router.post("/me/reset-balance", requireAuth, resetBalance);
router.delete("/me", requireAuth, deleteMe);

export default router;