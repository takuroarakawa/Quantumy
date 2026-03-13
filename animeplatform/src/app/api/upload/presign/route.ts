import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPresignedUploadUrl } from "@/lib/r2";
import { nanoid } from "nanoid";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { filename, contentType, fileSize, type } = await request.json();

  if (type === "video") {
    if (!ALLOWED_VIDEO_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "mp4, webm, mov のみ対応" }, { status: 400 });
    }
    if (fileSize > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: "ファイルサイズは2GB以下" }, { status: 400 });
    }
  } else if (type === "image") {
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "jpeg, png, webp のみ対応" }, { status: 400 });
    }
    if (fileSize > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "画像は10MB以下" }, { status: 400 });
    }
  }

  const ext = filename.split(".").pop();
  const key = `${type}s/${session.user.id}/${nanoid()}/${nanoid()}.${ext}`;
  const presignedUrl = await createPresignedUploadUrl(key, contentType);

  return NextResponse.json({ presignedUrl, key });
}
