import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    target: "es2022",
    treeshake: false,
  },
  {
    entry: ["src/cli.ts"],
    format: ["esm"],
    clean: false,
    target: "es2022",
    treeshake: true,
    external: ["jiti"],
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
