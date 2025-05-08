import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env file based on mode (development or production)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Fallback values for development if env variables aren't loaded
  const poolConfig = {
    userPoolId: env.VITE_AWS_USER_POOL_ID || "us-east-1_shxqf0t8j",
    clientId: env.VITE_AWS_USER_POOL_WEB_CLIENT_ID || "619fttc28pc5jj0vlnj1qa4h46"
  };

  return {
    plugins: [react(), tailwindcss()],
    base: "/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        './runtimeConfig': './runtimeConfig.browser',
      },
    },
    define: {
      // Define the values with fallbacks
      'import.meta.env.VITE_AWS_USER_POOL_ID': JSON.stringify(poolConfig.userPoolId),
      'import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID': JSON.stringify(poolConfig.clientId),
      // Additional env vars
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_AWS_REGION': JSON.stringify(env.VITE_AWS_REGION),
      // Add mode for conditional logic
      'import.meta.env.MODE': JSON.stringify(mode)
    }
  };
});
