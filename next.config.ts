import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  serverExternalPackages: [
    "pino",
    "pino-pretty",
    "pino-abstract-transport",
    "pino-std-serializers",
    "thread-stream",
    "sonic-boom",
    "on-exit-leak-free",
  ],
  outputFileTracingIncludes: {
    "/api/copilotkit": [
      "./node_modules/pino/**/*",
      "./node_modules/pino-pretty/**/*",
      "./node_modules/pino-abstract-transport/**/*",
      "./node_modules/pino-std-serializers/**/*",
      "./node_modules/thread-stream/**/*",
      "./node_modules/sonic-boom/**/*",
      "./node_modules/on-exit-leak-free/**/*",
      "./node_modules/fast-redact/**/*",
      "./node_modules/quick-format-unescaped/**/*",
      "./node_modules/secure-json-parse/**/*",
    ],
  },
};

export default nextConfig;
