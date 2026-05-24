import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import { uploadAvatar, deleteAvatar } from "../services/upload.service";
import { User } from "../models/User";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export async function uploadAvatarHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const multerReq = req as MulterRequest;

    if (!multerReq.file) {
      res.status(400).json({ success: false, error: "No file uploaded" });
      return;
    }

    const avatarUrl = await uploadAvatar(multerReq.file.buffer, userId);
    await User.findByIdAndUpdate(userId, { avatar: avatarUrl });
    res.json({ success: true, data: { avatar: avatarUrl } });
  } catch (err) {
    next(err);
  }
}

export async function deleteAvatarHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    await deleteAvatar(userId);
    await User.findByIdAndUpdate(userId, { avatar: null });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}