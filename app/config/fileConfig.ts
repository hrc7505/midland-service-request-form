export const FILE_CATEGORY = {
    IMAGE: "image",
    VIDEO: "video",
    DOCUMENT: "document",
    UNKNOWN: "unknown",
} as const;

export const PDF_MIME_TYPE = "application/pdf";

export type FileCategory = typeof FILE_CATEGORY[keyof typeof FILE_CATEGORY];

export const FILE_CONFIG = {
    [FILE_CATEGORY.IMAGE]: {
        attachmentType: "Image",
        maxSizeMB: 2,
        extensions: [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"],
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
    },
    [FILE_CATEGORY.VIDEO]: {
        attachmentType: "Video",
        maxSizeMB: 25,
        extensions: [".mp4", ".mov", ".webm"],
        mimeTypes: ["video/mp4", "video/quicktime", "video/webm"],
    },
    [FILE_CATEGORY.DOCUMENT]: {
        attachmentType: "Document",
        maxSizeMB: 8,
        extensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx"],
        mimeTypes: [
            PDF_MIME_TYPE,
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
    },
} as const;

export const ALL_ALLOWED_EXTENSIONS = Object.values(FILE_CONFIG).flatMap(config => config.extensions);

export const ALL_ALLOWED_MIME_TYPES = Object.values(FILE_CONFIG).flatMap(config => config.mimeTypes);

export const FILE_UPLOADER_ACCEPT_STRING = [...ALL_ALLOWED_MIME_TYPES, ...ALL_ALLOWED_EXTENSIONS].join(",");

// Precompute lookup maps for O(1) performance
const MIME_TYPE_TO_CATEGORY = new Map<string, FileCategory>();
const EXTENSION_TO_CATEGORY = new Map<string, FileCategory>();

Object.entries(FILE_CONFIG).forEach(([category, config]) => {
    config.mimeTypes.forEach(mime => MIME_TYPE_TO_CATEGORY.set(mime, category as FileCategory));
    config.extensions.forEach(ext => EXTENSION_TO_CATEGORY.set(ext, category as FileCategory));
});

export function getFileCategory(file: File | { type: string; name: string }): FileCategory {
    const type = (file.type || "").toLowerCase();
    
    // 1. O(1) MIME type lookup
    if (MIME_TYPE_TO_CATEGORY.has(type)) {
        return MIME_TYPE_TO_CATEGORY.get(type)!;
    }
    
    // 2. Fallback to O(1) extension lookup
    const extension = "." + (file.name || "").split('.').pop()?.toLowerCase();
    if (EXTENSION_TO_CATEGORY.has(extension)) {
        return EXTENSION_TO_CATEGORY.get(extension)!;
    }
    
    return FILE_CATEGORY.UNKNOWN;
}
