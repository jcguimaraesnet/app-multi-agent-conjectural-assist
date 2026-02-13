import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  serverExternalPackages: ["pino", "pino-pretty"],
  outputFileTracingIncludes: {
    "/**": ["./node_modules/styled-jsx/**/*"],
    "/api/copilotkit": [
      "./node_modules/pino/**/*",
      "./node_modules/pino-pretty/**/*",
      "./node_modules/thread-stream/**/*",
      "./node_modules/sonic-boom/**/*",
      "./node_modules/on-exit-leak-free/**/*",
      "./node_modules/pino-abstract-transport/**/*",
      "./node_modules/pino-std-serializers/**/*",
      "./node_modules/real-require/**/*",
      "./node_modules/@pinojs/redact/**/*",
      "./node_modules/fast-redact/**/*",
      "./node_modules/quick-format-unescaped/**/*",
      "./node_modules/safe-stable-stringify/**/*",
      "./node_modules/atomic-sleep/**/*",
      "./node_modules/process-warning/**/*",
      "./node_modules/secure-json-parse/**/*",
      "./node_modules/colorette/**/*",
      "./node_modules/dateformat/**/*",
      "./node_modules/fast-copy/**/*",
      "./node_modules/fast-safe-stringify/**/*",
      "./node_modules/help-me/**/*",
      "./node_modules/joycon/**/*",
      "./node_modules/minimist/**/*",
      "./node_modules/pump/**/*",
      "./node_modules/readable-stream/**/*",
      "./node_modules/strip-json-comments/**/*",
    ],
  },
};

export default nextConfig;
