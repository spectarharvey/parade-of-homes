import { NextResponse } from "next/server";
import { cloudinary, cloudinaryConfigured } from "@/lib/cloudinary";
import { json, error, requireRole } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await requireRole("ADMIN");
  if (session instanceof NextResponse) return session;

  if (!cloudinaryConfigured()) {
    return error(
      "Image uploads are not configured. Set CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET).",
      503
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return error("No file provided");

  try {
    const buffer = Buffer.from(await (file as File).arrayBuffer());
    const dataUri = `data:${(file as File).type};base64,${buffer.toString("base64")}`;
    const res = await cloudinary.uploader.upload(dataUri, {
      folder: "parade-of-homes",
    });
    return json({ url: res.secure_url });
  } catch (e) {
    console.error("[upload] failed:", (e as Error).message);
    return error("Upload failed", 500);
  }
}
