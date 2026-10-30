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
