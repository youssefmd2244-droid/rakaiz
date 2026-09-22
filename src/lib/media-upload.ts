/** Browser-side helpers for uploading images / videos to /api/media (used by the control panel). */

// Vercel serverless functions accept request bodies up to 4.5MB, so files are limited to 4MB.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
export const VIDEO_ACCEPT = "video/mp4,video/webm";

/** Shrinks big photos in the browser before upload (max 1600px, JPEG) so they load fast. */
export async function prepareFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  if (file.type === "image/png" && file.size <= 1.2 * 1024 * 1024) return file; // keep transparency for small PNGs

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], "image.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/** Uploads a file and returns its URL (e.g. /api/media/12). Throws an Arabic error message on failure. */
export async function uploadFile(original: File): Promise<string> {
  const file = await prepareFile(original);
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("حجم الملف أكبر من 4 ميجا. للفيديوهات الكبيرة استخدم رابط (يوتيوب أو رابط مباشر).");
  }
  const form = new FormData();
  form.append("file", file, file.name);
  const res = await fetch("/api/media", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.error || "فشل رفع الملف");
  return data.url as string;
}

export const isVideoFile = (file: File): boolean => file.type.startsWith("video/");

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
