import type { PluginSettingValue } from "./settings";

export type PluginContext = {
  locale: string;
  timezone: string;
  now: string;

  settings: PluginSettingsAPI;
  storage: PluginStorageAPI;
  network: PluginNetworkAPI;
  clipboard: PluginClipboardAPI;
};

export type PluginSettingsAPI = {
  get(id: string): Promise<PluginSettingValue | null>;
  set(id: string, value: PluginSettingValue): Promise<void>;
};

export type PluginStorageAPI = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
};

export type PluginClipboardAPI = {
  copy(value: string): Promise<void>;
};

export type PluginNetworkAPI = {
  fetch(url: string, options?: PluginFetchOptions): Promise<PluginFetchResponse>;
};

export type PluginFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
};

export type PluginFetchResponse = {
  status: number;
  headers: Record<string, string>;
  body: string;
};
