export type PlaceholderAction = "enter" | "select";

export function getPlaceholder(label: string, action: PlaceholderAction = "enter"): string {
  const normalizedLabel = label.trim();

  if (!normalizedLabel) {
    return "";
  }

  const prefix = action === "select" ? "Select" : "Enter";

  return `${prefix} ${normalizedLabel.toLowerCase()}`;
}
