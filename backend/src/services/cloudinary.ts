import { v2 as cloudinary } from "cloudinary";
import { cloudinaryConfigured, config } from "../config";

export function initCloudinary(): void {
  if (!cloudinaryConfigured()) return;
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

export function getSignedUploadParams(folder?: string): {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
} {
  if (!cloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
  const resolvedFolder = folder || config.cloudinary.folder || "jewellery-store";
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder: resolvedFolder };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, config.cloudinary.apiSecret);
  return {
    timestamp,
    signature,
    apiKey: config.cloudinary.apiKey,
    cloudName: config.cloudinary.cloudName,
    folder: resolvedFolder,
  };
}

export async function destroyCloudinaryAsset(opts: {
  publicId?: string | null;
  url?: string | null;
}): Promise<void> {
  if (!cloudinaryConfigured()) return;
  let publicId = opts.publicId?.trim() || null;
  if (!publicId && opts.url?.includes("res.cloudinary.com")) {
    const match = opts.url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/);
    publicId = match?.[1] ?? null;
  }
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // DB row will still be removed by the caller
  }
}

/** @deprecated prefer destroyCloudinaryAsset */
export async function destroyCloudinaryByUrl(url: string): Promise<void> {
  await destroyCloudinaryAsset({ url });
}
