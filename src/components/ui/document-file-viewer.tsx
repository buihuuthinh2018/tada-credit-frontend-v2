"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  File,
  Loader2,
} from "lucide-react";
import {
  useFileUrl,
  openFileInNewTab,
  downloadFile,
  isImageMimeType,
  isPdfMimeType,
  formatFileSize,
} from "@/hooks/use-file-access";

interface DocumentFileViewerProps {
  fileId: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  showPreviewButton?: boolean;
  showDownloadButton?: boolean;
  showOpenButton?: boolean;
}

/**
 * Component to view/download document files
 * Handles presigned URLs automatically
 */
export function DocumentFileViewer({
  fileId,
  fileName = "document",
  mimeType = "application/octet-stream",
  fileSize,
  showPreviewButton = true,
  showDownloadButton = true,
  showOpenButton = true,
}: DocumentFileViewerProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Only fetch URL when preview dialog is open
  const { data: fileUrlData, isLoading: isLoadingUrl } = useFileUrl(fileId, {
    enabled: isPreviewOpen,
    expiresIn: 3600,
  });

  const isImage = isImageMimeType(mimeType);
  const isPdf = isPdfMimeType(mimeType);
  const canPreview = isImage || isPdf;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadFile(fileId);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = () => {
    openFileInNewTab(fileId);
  };

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="w-4 h-4" />;
    if (isPdf) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center gap-2">
      {/* File info */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {getFileIcon()}
        <div className="truncate">
          <span className="text-sm font-medium truncate">{fileName}</span>
          {fileSize && (
            <span className="text-xs text-gray-500 ml-2">
              ({formatFileSize(fileSize)})
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Preview button (for images and PDFs) */}
        {showPreviewButton && canPreview && (
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" title="Xem trước">
                <Eye className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getFileIcon()}
                  {fileName}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 overflow-auto">
                {isLoadingUrl ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : fileUrlData?.url ? (
                  isImage ? (
                    <img
                      src={fileUrlData.url}
                      alt={fileName}
                      className="max-w-full h-auto mx-auto rounded-lg"
                    />
                  ) : isPdf ? (
                    <iframe
                      src={fileUrlData.url}
                      className="w-full h-[70vh] rounded-lg border"
                      title={fileName}
                    />
                  ) : null
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Không thể tải file
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Open in new tab */}
        {showOpenButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenInNewTab}
            title="Mở trong tab mới"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}

        {/* Download button */}
        {showDownloadButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            title="Tải xuống"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Thumbnail component for image files
 * Shows a small preview that can be clicked to view full size
 */
interface ImageThumbnailProps {
  fileId: string;
  fileName?: string;
  className?: string;
  onClick?: () => void;
}

export function ImageThumbnail({
  fileId,
  fileName = "image",
  className = "",
  onClick,
}: ImageThumbnailProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { data: fileUrlData, isLoading } = useFileUrl(fileId, {
    expiresIn: 3600,
  });

  if (isLoading) {
    return <Skeleton className={`w-20 h-20 rounded ${className}`} />;
  }

  if (!fileUrlData?.url) {
    return (
      <div
        className={`w-20 h-20 rounded bg-gray-100 flex items-center justify-center ${className}`}
      >
        <ImageIcon className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div
      className={`relative cursor-pointer ${className}`}
      onClick={onClick}
    >
      {!isLoaded && (
        <Skeleton className="absolute inset-0 rounded" />
      )}
      <img
        src={fileUrlData.url}
        alt={fileName}
        className={`w-20 h-20 object-cover rounded transition-opacity ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}

/**
 * File card component showing file info with actions
 */
interface FileCardProps {
  fileId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export function FileCard({ fileId, fileName, mimeType, fileSize }: FileCardProps) {
  const isImage = isImageMimeType(mimeType);

  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
      {isImage ? (
        <div className="mb-2">
          <ImageThumbnail fileId={fileId} fileName={fileName} className="w-full h-32 object-cover" />
        </div>
      ) : (
        <div className="w-full h-32 bg-gray-50 rounded flex items-center justify-center mb-2">
          {isPdfMimeType(mimeType) ? (
            <FileText className="w-12 h-12 text-red-500" />
          ) : (
            <File className="w-12 h-12 text-gray-400" />
          )}
        </div>
      )}
      <DocumentFileViewer
        fileId={fileId}
        fileName={fileName}
        mimeType={mimeType}
        fileSize={fileSize}
      />
    </div>
  );
}
