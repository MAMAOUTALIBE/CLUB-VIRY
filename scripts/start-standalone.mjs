import path from "node:path";
import { pathToFileURL } from "node:url";

import { loadRuntimeEnv } from "./runtime-env.mjs";

process.env.NODE_ENV ||= "production";

loadRuntimeEnv({
  root: process.cwd(),
  nodeEnv: process.env.NODE_ENV
});

const serverPath = path.join(process.cwd(), ".next", "standalone", "server.js");

await import(pathToFileURL(serverPath).href);
