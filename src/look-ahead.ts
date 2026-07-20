export type LookAheadItemKind =
  | "calendar"
  | "weather"
  | "reminder"
  | "timer"
  | "plugin";

export type LookAheadItem = {
  id: string;
  title: string;
  subtitle?: string;
  /** SF Symbol name used by the native look-ahead presentation. */
  icon?: string;
  kind: LookAheadItemKind;
  /** ISO 8601 timestamps used for ordering and presentation. */
  startDate?: string;
  endDate?: string;
  progress?: number;
  priority?: number;
};
