import { definePlugin, LookAhead } from "../../dist/index.js";

export default definePlugin({
  metadata: {
    id: "com.example.missing-title",
    name: "Missing Title",
    version: "1.0.0",
    author: "Kepler",
  },
  lookAhead: [
    LookAhead.items({
      id: "upcoming",
      run: () => [],
    }),
  ],
});
