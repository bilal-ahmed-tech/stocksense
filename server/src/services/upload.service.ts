import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadAvatar(
  fileBuffer: Buffer,
  userId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "stocksense/avatars",
          public_id: `avatar_${userId}`,
          overwrite: true,
          transformation: [
            { width: 200, height: 200, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        }
      )
      .end(fileBuffer);
  });
}

export async function deleteAvatar(userId: string): Promise<void> {
  await cloudinary.uploader.destroy(`stocksense/avatars/avatar_${userId}`);
}