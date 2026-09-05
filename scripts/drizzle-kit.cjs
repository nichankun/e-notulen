/* eslint-disable @typescript-eslint/no-require-imports -- Drizzle Kit exposes a CommonJS CLI entrypoint. */
const os = require("node:os");
const path = require("node:path");

// Drizzle Kit embeds tsx, which asks for the OS username to create a temporary
// directory. Some restricted Windows runners return ENOMEM from os.userInfo().
// Keep the normal OS value whenever available and provide a local-only fallback
// so migration checks do not fail before Drizzle reads the project config.
try {
  os.userInfo();
} catch {
  const username = process.env.USERNAME || process.env.USER || "e-notulen";
  os.userInfo = () => ({
    username,
    uid: -1,
    gid: -1,
    shell: null,
    homedir: os.tmpdir(),
  });
}

require(path.join(__dirname, "..", "node_modules", "drizzle-kit", "bin.cjs"));
