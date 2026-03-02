import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ORIGIN } from "@/lib/api-client";
import { toast } from "sonner";

// Types for file access
export interface FileUrlResponse {
  url: string;
  expiresAt: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface BatchFileUrlsResponse {
  [fileId: string]: FileUrlResponse | { error: string };
}

/**
 * Resolve a file URL from the backend.
 * Proxy URLs (starting with /api/) are relative to the server origin.
 * Absolute URLs are returned as-is.
 */
function resolveFileUrl(url: string): string {
  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`;
  }
  return url;
}

/**
 * Hook to get a presigned URL for viewing/downloading a document file
 * The URL is cached and will be refetched when it expires
 */
export function useFileUrl(
  fileId: string | undefined,
  options?: {
    expiresIn?: number;
    download?: boolean;
    enabled?: boolean;
  }
) {
  const { expiresIn = 3600, download = false, enabled = true } = options || {};

  return useQuery({
    queryKey: ["file-url", fileId, { expiresIn, download }],
    queryFn: async () => {
      if (!fileId) throw new Error("File ID is required");

      const response = await apiClient.get<FileUrlResponse>(
        `/files/documents/${fileId}/url`,
        {
          params: { expiresIn, download },
        }
      );
      return {
        ...response.data,
        url: resolveFileUrl(response.data.url),
      };
    },
    enabled: enabled && !!fileId,
    // Cache for slightly less than the expiration time to ensure freshness
    staleTime: (expiresIn - 60) * 1000,
    // Don't retry on 404 or 403
    retry: (failureCount, error: { response?: { status?: number } }) => {
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to get presigned URLs for multiple files at once
 * Useful when displaying a list of documents
 */
export function useBatchFileUrls(
  fileIds: string[],
  options?: {
    expiresIn?: number;
    enabled?: boolean;
  }
) {
  const { expiresIn = 3600, enabled = true } = options || {};

  return useQuery({
    queryKey: ["batch-file-urls", fileIds.sort().join(","), { expiresIn }],
    queryFn: async () => {
      if (!fileIds.length) return {};

      const response = await apiClient.get<BatchFileUrlsResponse>(
        `/files/documents/batch-urls`,
        {
          params: {
            fileIds: fileIds.join(","),
            expiresIn,
          },
        }
      );
      // Resolve proxy URLs in batch response
      const resolved: BatchFileUrlsResponse = {};
      for (const [id, val] of Object.entries(response.data)) {
        if ('url' in val) {
          resolved[id] = { ...val, url: resolveFileUrl(val.url) };
        } else {
          resolved[id] = val;
        }
      }
      return resolved;
    },
    enabled: enabled && fileIds.length > 0,
    staleTime: (expiresIn - 60) * 1000,
  });
}

/**
 * Get the direct stream URL for a file (for embedding images)
 * This URL requires authentication, so use it with img src only if you handle auth
 */
export function getFileStreamUrl(fileId: string): string {
  return `/api/files/documents/${fileId}/stream`;
}

/**
 * Get the direct download URL for a file
 */
export function getFileDownloadUrl(fileId: string): string {
  return `/api/files/documents/${fileId}/download`;
}

/**
 * Hook to prefetch file URLs (useful for lazy loading)
 */
export function usePrefetchFileUrl() {
  const queryClient = useQueryClient();

  return (fileId: string, expiresIn = 3600) => {
    queryClient.prefetchQuery({
      queryKey: ["file-url", fileId, { expiresIn, download: false }],
      queryFn: async () => {
        const response = await apiClient.get<FileUrlResponse>(
          `/files/documents/${fileId}/url`,
          { params: { expiresIn } }
        );
        return {
          ...response.data,
          url: resolveFileUrl(response.data.url),
        };
      },
    });
  };
}

/**
 * Utility function to open a file in a new tab using presigned URL
 */
export async function openFileInNewTab(fileId: string): Promise<void> {
  try {
    const response = await apiClient.get<FileUrlResponse>(
      `/files/documents/${fileId}/url`,
      { params: { expiresIn: 3600 } }
    );
    window.open(resolveFileUrl(response.data.url), "_blank");
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    toast.error(err?.response?.data?.message || "Không thể mở file");
  }
}

/**
 * Utility function to download a file
 */
export async function downloadFile(fileId: string): Promise<void> {
  try {
    const response = await apiClient.get<FileUrlResponse>(
      `/files/documents/${fileId}/url`,
      { params: { expiresIn: 3600, download: true } }
    );

    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = resolveFileUrl(response.data.url);
    link.download = response.data.fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    toast.error(err?.response?.data?.message || "Không thể tải file");
  }
}

/**
 * Helper to check if a MIME type is an image
 */
export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

/**
 * Helper to check if a MIME type is a PDF
 */
export function isPdfMimeType(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

/**
 * Helper to get file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? "" : fileName.substring(lastDot + 1).toLowerCase();
}

/**
 * Helper to format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
