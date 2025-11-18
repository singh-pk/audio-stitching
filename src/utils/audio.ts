/**
 * Metadata for a audio stored in OPFS
 * This interface is designed to be extensible - add new properties as needed
 */
export interface AudioMetadata {
  // Core properties
  name: string;
  folderName: string;
  fileName: string;

  // Visual properties
  color: string;
  cover: string; // Optional thumbnail/cover image URL or data URL

  // File properties
  size: number; // File size in bytes
  mimeType: string;
  duration?: number; // Audio duration in seconds (if available)

  // Timestamps
  uploadedAt: number; // Unix timestamp
  lastModified: number; // Unix timestamp from file

  // Optional extended properties (future-extensible)
  metadata?: {
    bitrate?: number;
    codec?: string;
    fps?: number;
  };
}

/**
 * Map of audio file extensions to MIME types
 * Used when file.type is empty or unavailable
 */
export const AUDIO_MIME_TYPES: Record<string, string> = {
  // Standard web audio formats
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  oga: "audio/ogg",

  // AAC formats
  aac: "audio/aac",
  m4a: "audio/mp4",
  m4b: "audio/mp4",
  m4p: "audio/mp4",

  // FLAC and lossless formats
  flac: "audio/flac",
  alac: "audio/x-alac",

  // WebM audio
  weba: "audio/webm",

  // AIFF formats
  aiff: "audio/aiff",
  aif: "audio/aiff",
  aifc: "audio/aiff",

  // Other common formats
  opus: "audio/opus",
  wma: "audio/x-ms-wma",

  // Legacy and specialized formats
  au: "audio/basic",
  snd: "audio/basic",
  mid: "audio/midi",
  midi: "audio/midi",
  kar: "audio/midi",
  rmi: "audio/midi",

  // 3GPP audio
  "3gp": "audio/3gpp",
  "3ga": "audio/3gpp",

  // Adaptive streaming
  m3u: "audio/x-mpegurl",
  m3u8: "audio/x-mpegurl",

  // MPEG formats
  mp1: "audio/mpeg",
  mp2: "audio/mpeg",
  mpa: "audio/mpeg",

  // Real Audio
  ra: "audio/x-realaudio",
  ram: "audio/x-pn-realaudio",
  rm: "audio/x-pn-realaudio",

  // Other formats
  ape: "audio/x-monkeys-audio",
  wv: "audio/x-wavpack",
  tta: "audio/x-tta",
  dts: "audio/vnd.dts",
  dtshd: "audio/vnd.dts.hd",
  ac3: "audio/ac3",
  eac3: "audio/eac3",
  amr: "audio/amr",
  awb: "audio/amr-wb",
  voc: "audio/x-voc",
  spx: "audio/ogg",
};

/**
 * Get MIME type from file extension
 * @param fileName - The name of the file
 * @returns The MIME type string, defaults to "audio/mp3" if unknown
 */
export const getMimeTypeFromExtension = (fileName: string): string => {
  const ext = fileName.toLowerCase().split(".").pop();
  return AUDIO_MIME_TYPES[ext || ""] || "audio/mp3";
};

/**
 * Generate a random color for video folders
 */
export const generateAudioColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 20);
  const lightness = 50 + Math.floor(Math.random() * 20);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Create default metadata for a video file
 */
export const createAudioMetadata = (
  file: File,
  folderName: string,
  thumbnail: string,
): AudioMetadata => {
  return {
    name: file.name.replace(/\.[^/.]+$/, ""), // Name without extension
    folderName,
    fileName: file.name,
    color: generateAudioColor(),
    size: file.size,
    mimeType: file.type || getMimeTypeFromExtension(file.name),
    uploadedAt: Date.now(),
    lastModified: file.lastModified,
    cover: thumbnail,
  };
};

/**
 * Check if a file is a valid audio file
 * @param file - The file to check
 * @returns true if the file is a valid audio file
 */
export const isValidAudioFile = (file: File): boolean => {
  const mimeType = file.type;
  const fileName = file.name.toLowerCase();
  const ext = fileName.split(".").pop();

  // If MIME type is provided, check if it starts with "video/" or matches known video MIME types
  if (mimeType.length > 0) {
    const validMimeTypes = Object.values(AUDIO_MIME_TYPES);
    return mimeType.startsWith("audio/") || validMimeTypes.includes(mimeType);
  }

  // Fallback to extension check using AUDIO_MIME_TYPES keys
  return !!(ext && ext in AUDIO_MIME_TYPES);
};
