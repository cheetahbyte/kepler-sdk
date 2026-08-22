import { definePlugin, Provider } from "../../dist/index.js";

export default definePlugin({
  metadata: {
    id: "com.example.missing-match",
    name: "Missing Match",
    version: "1.0.0",
    author: "Kepler",
  },
  searchProviders: [
    Provider.results({
      id: "docs",
      run: () => [],
    }),
  ],
});
