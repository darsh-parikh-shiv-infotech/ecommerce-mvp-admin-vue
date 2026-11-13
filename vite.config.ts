import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const apiPrefix = env.VITE_API_BASE_URL;

  return {
    plugins: [vue()],
    server: {
      proxy: {
        [apiPrefix]: {
          target: env.VITE_API_TARGET,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${apiPrefix}`), ""),
        },
      },
    },
  };
});
