import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME || "animefree-videos";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2Client, command, { expiresIn });
}

export async function deleteR2Object(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });
  return r2Client.send(command);
}

export function getPublicUrl(key: string) {
  return `${R2_PUBLIC_URL}/${key}`;
}

export function generateVideoKey(userId: string, seriesId: string, episodeNumber: number) {
  const timestamp = Date.now();
  return `videos/${userId}/${seriesId}/ep${episodeNumber}_${timestamp}.mp4`;
}

export function generateThumbnailKey(userId: string, seriesId: string, episodeNumber: number) {
  const timestamp = Date.now();
  return `thumbnails/${userId}/${seriesId}/ep${episodeNumber}_${timestamp}.jpg`;
}
