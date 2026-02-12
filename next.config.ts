import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  serverExternalPackages: ["pino", "pino-pretty"],
  outputFileTracingIncludes: {
    "/api/copilotkit": [
      "./node_modules/pino/**/*",
      "./node_modules/pino-pretty/**/*",
      "./node_modules/thread-stream/**/*",
    ],
  },
};

export default nextConfig;
