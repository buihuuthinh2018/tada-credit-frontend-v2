"use client";

import { WorkflowStage } from "@/types";
import { getStageBadgeStyle, getStageColor, getContrastColor } from "@/lib/stage-utils";
import { cn } from "@/lib/utils";

interface StageBadgeProps {
  stage?: WorkflowStage | null;
  className?: string;
  variant?: "default" | "outline" | "solid";
  size?: "sm" | "md" | "lg";
}

export function StageBadge({ 
  stage, 
  className,
  variant = "default",
  size = "md"
}: StageBadgeProps) {
  const color = getStageColor(stage);
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  const getVariantStyle = (): React.CSSProperties => {
    switch (variant) {
      case "solid":
        return {
          backgroundColor: color,
          color: getContrastColor(color),
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: color,
          borderColor: color,
          borderWidth: "1px",
          borderStyle: "solid",
        };
      default:
        return {
          backgroundColor: `${color}20`, // 20% opacity
          color: color,
        };
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full whitespace-nowrap",
        sizeClasses[size],
        className
      )}
      style={getVariantStyle()}
    >
      {stage?.name || "N/A"}
    </span>
  );
}
