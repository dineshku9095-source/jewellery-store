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

export function getSignedUploadParams(folder = "jewellery"): {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
} {
  if (!cloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, config.cloudinary.apiSecret);
  return {
    timestamp,
    signature,
    apiKey: config.cloudinary.apiKey,
    cloudName: config.cloudinary.cloudName,
    folder,
  };
}

/** Best-effort Cloudinary destroy from a delivery URL. No-op if unconfigured or not a Cloudinary URL. */
export async function destroyCloudinaryByUrl(url: string): Promise<void> {
  if (!cloudinaryConfigured() || !url.includes("res.cloudinary.com")) return;
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/);
    const publicId = match?.[1];
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // DB row will still be removed by the caller
  }
}
