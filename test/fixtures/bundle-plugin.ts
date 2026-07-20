import { Command, definePlugin } from "@kepler-app/plugin-sdk";

export default definePlugin({
  metadata: {
    id: "com.example.bundle-contract",
    name: "Bundle Contract",
    version: "1.0.0",
    author: "Kepler",
  },
  searchModes: [
    Command.search({
      id: "search",
      title: "Search",
      run: () => [],
    }),
  ],
});
