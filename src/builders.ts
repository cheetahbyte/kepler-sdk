import type { PluginCommand, PluginProvider, PluginResolver, PluginLookAhead } from "./contributions";

export const Command = {
  search(config: PluginCommand): PluginCommand {
    return config;
  },
};

export const Provider = {
  results(config: PluginProvider): PluginProvider {
    return config;
  },
};

export const Widget = {
  inline(config: PluginResolver): PluginResolver {
    return config;
  },
};

export const LookAhead = {
  items(config: PluginLookAhead): PluginLookAhead {
    return config;
  },
};
