export type PluginSettingDefinition =
  | { id: string; title: string; description?: string; kind: "toggle";     defaultValue: boolean }
  | { id: string; title: string; description?: string; kind: "text";       defaultValue: string }
  | { id: string; title: string; description?: string; kind: "secureText"; defaultValue: string }
  | { id: string; title: string; description?: string; kind: "number";     defaultValue: number; min?: number; max?: number; step?: number }
  | { id: string; title: string; description?: string; kind: "picker";     defaultValue: string; options: Array<{ id: string; title: string }> };
