export interface CloudinaryTransformation {
  quality?: string;
  fetch_format?: string;
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
}

export interface UploadPreset {
  folder: string;
  resource_type: string;
  allowed_formats: string[];
  transformation: CloudinaryTransformation[];
}

export interface UploadParams extends UploadPreset {
  public_id: string;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  created_at: string;
  bytes: number;
  folder: string;
  resource_type: string;
  type: string;
  url: string;
}

export interface CloudinaryError {
  message: string;
  name: string;
  http_code: number;
} 