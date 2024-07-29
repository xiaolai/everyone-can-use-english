import path from "path";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import type { ConfigEnv, UserConfig } from "vite";
import { defineConfig } from "vite";
import { pluginExposeRenderer } from "./vite.base.config";

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<"renderer">;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? "";

  return {
    root,
    mode,
    base: "./",
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [
      pluginExposeRenderer(name),
      react(),
      viteStaticCopy({
        targets: [
          {
            src: "assets/*",
            dest: "assets",
          },
          {
            src: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
            dest: "./",
          },
          {
            src: "node_modules/@ricky0123/vad-web/dist/silero_vad.onnx",
            dest: "./",
          },
          {
            src: "node_modules/onnxruntime-web/dist/*.wasm",
            dest: "./",
          },
        ],
      }),
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@renderer": path.resolve(__dirname, "./src/renderer"),
        "@commands": path.resolve(__dirname, "./src/commands"),
      },
    },
    optimizeDeps: {
      exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
    },
    clearScreen: false,
  } as UserConfig;
});
