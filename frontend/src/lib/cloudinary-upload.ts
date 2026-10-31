import { apiGet, fetchAdminCsrf } from "@/lib/api";

export type SignedUploadParams = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
};

export type UploadedImage = {
  url: string;
  publicId: string;
};

export async function fetchUploadSign(): Promise<SignedUploadParams> {
  // CSRF cookie refresh keeps session-bound tokens valid for subsequent posts
  await fetchAdminCsrf();
  return apiGet<SignedUploadParams>("/api/admin/uploads/sign");
}

/** Direct browser upload to Cloudinary using signed params from the API. */
export async function uploadImageFile(file: File): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`“${file.name}” is not an image file`);
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error(`“${file.name}” is larger than 8MB`);
  }

  let params: SignedUploadParams;
  try {
    params = await fetchUploadSign();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload signing failed";
    if (/not configured|503/i.test(msg)) {
      throw new Error(
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on the API service, then redeploy."
      );
    }
    throw err;
  }

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", params.apiKey);
  body.append("timestamp", String(params.timestamp));
  body.append("signature", params.signature);
  body.append("folder", params.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`, {
    method: "POST",
    body,
  });
  const data = (await res.json().catch(() => ({}))) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string };
  };
  if (!res.ok || !data.secure_url || !data.public_id) {
    throw new Error(data.error?.message ?? `Cloudinary upload failed (${res.status})`);
  }
  return { url: data.secure_url, publicId: data.public_id };
}

export async function uploadImageFiles(files: File[]): Promise<UploadedImage[]> {
  const out: UploadedImage[] = [];
  for (const file of files) {
    out.push(await uploadImageFile(file));
  }
  return out;
}
