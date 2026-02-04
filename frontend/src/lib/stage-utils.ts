import { WorkflowStage } from "@/types";

// Default color when stage has no color defined
export const DEFAULT_STAGE_COLOR = "#6B7280"; // Gray

/**
 * Get the hex color from a stage, with fallback to default
 */
export function getStageColor(stage?: WorkflowStage | null): string {
  return stage?.color || DEFAULT_STAGE_COLOR;
}

/**
 * Convert hex color to Tailwind-compatible CSS variables or inline styles
 * Returns an object suitable for style prop
 */
export function getStageColorStyle(stage?: WorkflowStage | null): React.CSSProperties {
  const color = getStageColor(stage);
  return {
    backgroundColor: color,
    color: getContrastColor(color),
  };
}

/**
 * Get badge style for a stage
 * Returns style object for custom colored badge
 */
export function getStageBadgeStyle(stage?: WorkflowStage | null): React.CSSProperties {
  const color = getStageColor(stage);
  return {
    backgroundColor: `${color}20`, // 20% opacity for background
    color: color,
    borderColor: color,
  };
}

/**
 * Determine if white or black text should be used for contrast
 * Based on luminance calculation
 */
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace("#", "");
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for bright colors, white for dark colors
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

/**
 * Predefined color options for admin to choose from
 */
export const STAGE_COLOR_OPTIONS = [
  { value: "#6B7280", label: "Xám", name: "gray" },
  { value: "#3B82F6", label: "Xanh dương", name: "blue" },
  { value: "#10B981", label: "Xanh lá", name: "green" },
  { value: "#F59E0B", label: "Cam", name: "amber" },
  { value: "#EF4444", label: "Đỏ", name: "red" },
  { value: "#8B5CF6", label: "Tím", name: "violet" },
  { value: "#EC4899", label: "Hồng", name: "pink" },
  { value: "#06B6D4", label: "Cyan", name: "cyan" },
  { value: "#84CC16", label: "Lime", name: "lime" },
  { value: "#F97316", label: "Cam đậm", name: "orange" },
];
