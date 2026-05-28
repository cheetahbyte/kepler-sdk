export type PluginSettingDefinition = {
  id: string;
  title: string;
  description?: string;
  kind: PluginSettingKind;
  defaultValue: PluginSettingValue;
};

export type PluginSettingKind =
  | { type: "toggle" }
  | { type: "text" }
  | { type: "secureText" }
  | {
      type: "number";
      min?: number;
      max?: number;
      step?: number;
    }
  | {
      type: "picker";
      options: PluginSettingOption[];
    };

export type PluginSettingOption = {
  id: string;
  title: string;
};

export type PluginSettingValue =
  | { type: "bool"; value: boolean }
  | { type: "string"; value: string }
  | { type: "number"; value: number };

export const Setting = {
  toggle(): PluginSettingKind {
    return { type: "toggle" };
  },

  text(): PluginSettingKind {
    return { type: "text" };
  },

  secureText(): PluginSettingKind {
    return { type: "secureText" };
  },

  number(options: { min?: number; max?: number; step?: number } = {}): PluginSettingKind {
    return { type: "number", ...options };
  },

  picker(options: PluginSettingOption[]): PluginSettingKind {
    return { type: "picker", options };
  },
};

export const SettingValue = {
  bool(value: boolean): PluginSettingValue {
    return { type: "bool", value };
  },

  string(value: string): PluginSettingValue {
    return { type: "string", value };
  },

  number(value: number): PluginSettingValue {
    return { type: "number", value };
  },
};
