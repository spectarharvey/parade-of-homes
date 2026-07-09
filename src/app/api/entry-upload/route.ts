import { json, error } from "@/lib/api";
import { cloudinary, cloudinaryConfigured } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public file upload for the Builder Entry & Sponsor forms.
// No login required, so we harden with mime + size limits.
const ALLOWED = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
];
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB (matches the largest field on the forms)

export async function POST(req: Request) {
  if (!cloudinaryConfigured()) {
    return error(
      "Uploads are not configured. Set CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET).",
      503
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return error("No file provided");

  const f = file as File;
  if (!ALLOWED.includes(f.type)) {
    return error("Unsupported file type. Use PNG, JPG, WEBP, or PDF.", 415);
  }
  if (f.size > MAX_BYTES) {
    return error("File too large. Max 25 MB.", 413);
  }

  try {
    const buffer = Buffer.from(await f.arrayBuffer());
    const dataUri = `data:${f.type};base64,${buffer.toString("base64")}`;
    const res = await cloudinary.uploader.upload(dataUri, {
      folder: "parade-of-homes/entries",
      // Keep PDFs as raw assets (so they don't get converted to images).
      resource_type: f.type === "application/pdf" ? "raw" : "image",
    });
    return json({ url: res.secure_url });
  } catch (e) {
    console.error("[entry-upload] failed:", (e as Error).message);
    return error("Upload failed", 500);
  }
}
