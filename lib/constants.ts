export const MIME_TYPES: Record<string, string> = {
  // Web Core
  html: "text/html; charset=utf-8",
  htm: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "application/javascript; charset=utf-8",
  mjs: "application/javascript; charset=utf-8",
  jsx: "text/javascript; charset=utf-8",
  ts: "application/typescript; charset=utf-8",
  tsx: "application/typescript; charset=utf-8",
  json: "application/json; charset=utf-8",
  webmanifest: "application/manifest+json; charset=utf-8",

  // Images
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  ico: "image/x-icon",
  bmp: "image/bmp",
  tiff: "image/tiff",
  tif: "image/tiff",
  avif: "image/avif",

  // Fonts
  woff: "font/woff",
  woff2: "font/woff2",
  eot: "application/vnd.ms-fontobject",
  ttf: "font/ttf",
  otf: "font/otf",

  // Documents
  pdf: "application/pdf",
  txt: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  csv: "text/csv; charset=utf-8",
  xml: "application/xml; charset=utf-8",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Audio / Video
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  mp4: "video/mp4",
  webm: "video/webm",
  ogv: "video/ogv",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",

  // Archives
  zip: "application/zip",
  rar: "application/vnd.rar",
  tar: "application/x-tar",
  gz: "application/gzip",
  "7z": "application/x-7z-compressed",

  // Shaders / 3D / Science / Other
  glsl: "text/x-glsl",
  vert: "text/x-vertex",
  frag: "text/x-fragment",
  gltf: "model/gltf+json",
  glb: "model/gltf-binary",
  obj: "model/obj",
  fbx: "application/octet-stream",
  wasm: "application/wasm",
};

export const DEFAULT_MIME_TYPE = "application/octet-stream";

export const FILE_CATEGORIES = {
  CODE: "code",
  MEDIA: "media",
  DATA: "data",
  OTHER: "other",
} as const;

export type FileCategory = typeof FILE_CATEGORIES[keyof typeof FILE_CATEGORIES];

export const CATEGORY_MAP: Record<string, FileCategory> = {
  // Code
  html: FILE_CATEGORIES.CODE,
  htm: FILE_CATEGORIES.CODE,
  css: FILE_CATEGORIES.CODE,
  js: FILE_CATEGORIES.CODE,
  mjs: FILE_CATEGORIES.CODE,
  jsx: FILE_CATEGORIES.CODE,
  ts: FILE_CATEGORIES.CODE,
  tsx: FILE_CATEGORIES.CODE,
  glsl: FILE_CATEGORIES.CODE,
  vert: FILE_CATEGORIES.CODE,
  frag: FILE_CATEGORIES.CODE,

  // Media
  png: FILE_CATEGORIES.MEDIA,
  jpg: FILE_CATEGORIES.MEDIA,
  jpeg: FILE_CATEGORIES.MEDIA,
  gif: FILE_CATEGORIES.MEDIA,
  svg: FILE_CATEGORIES.MEDIA,
  webp: FILE_CATEGORIES.MEDIA,
  ico: FILE_CATEGORIES.MEDIA,
  avif: FILE_CATEGORIES.MEDIA,
  mp3: FILE_CATEGORIES.MEDIA,
  wav: FILE_CATEGORIES.MEDIA,
  mp4: FILE_CATEGORIES.MEDIA,
  webm: FILE_CATEGORIES.MEDIA,
  mov: FILE_CATEGORIES.MEDIA,

  // Data
  json: FILE_CATEGORIES.DATA,
  xml: FILE_CATEGORIES.DATA,
  csv: FILE_CATEGORIES.DATA,
  txt: FILE_CATEGORIES.DATA,
  md: FILE_CATEGORIES.DATA,
};

export const CATEGORY_STYLES: Record<FileCategory, { bg: string; text: string; border: string }> = {
  code: {
    bg: "var(--success-muted)",
    text: "var(--success)",
    border: "rgba(34, 197, 94, 0.2)",
  },
  media: {
    bg: "rgba(139, 92, 246, 0.1)",
    text: "#a78bfa",
    border: "rgba(139, 92, 246, 0.2)",
  },
  data: {
    bg: "var(--info-muted)",
    text: "var(--info)",
    border: "rgba(56, 189, 248, 0.2)",
  },
  other: {
    bg: "var(--bg-hover)",
    text: "var(--text-secondary)",
    border: "var(--border-default)",
  },
};

export const CACHE_RULES = {
  // Immutable for versioned/long term assets: 1 year
  IMMUTABLE: "public, max-age=31536000, immutable",
  // Standard cache: 1 hour, revalidate after
  STANDARD: "public, max-age=3600, must-revalidate",
  // Dynamic or no cache (for admin panel APIs)
  NO_CACHE: "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export const LIMITS = {
  MAX_FILE_SIZE_MB: 500,
  MAX_FILES_PER_UPLOAD: 50,
};
