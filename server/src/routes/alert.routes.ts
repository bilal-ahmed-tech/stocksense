import { Router } from "express";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.middleware";
import { getAll, create, toggle, remove } from "../controllers/alert.controller";

const router = Router();

router.use(requireAuth);

router.get("/", getAll);
router.post("/", requireVerifiedEmail, create);
router.patch("/:id/toggle", toggle);
router.delete("/:id", remove);

export default router;
