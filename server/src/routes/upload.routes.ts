import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.middleware";
import {
  uploadAvatarHandler,
  deleteAvatarHandler,
} from "../controllers/upload.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const router = Router();

router.post("/avatar", requireAuth, upload.single("avatar"), uploadAvatarHandler);
router.delete("/avatar", requireAuth, deleteAvatarHandler);

export default router;