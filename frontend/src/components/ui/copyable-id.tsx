"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CopyableIdProps {
  id: string;
  prefix?: string;
  maxLength?: number;
  className?: string;
}

export function CopyableId({ id, prefix = "#", maxLength = 8, className = "" }: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  const displayId = id.length > maxLength ? `${id.slice(0, maxLength)}...` : id;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success("Đã copy ID!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể copy");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${className}`}>
            <span className="font-mono text-sm">
              {prefix}{displayId}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-mono text-xs">{id}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
