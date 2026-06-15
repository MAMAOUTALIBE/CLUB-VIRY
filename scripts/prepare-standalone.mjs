import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const standaloneNextDir = path.join(standaloneDir, ".next");

async function replaceDir(source, destination) {
  await rm(destination, { recursive: true, force: true });
  await cp(source, destination, { recursive: true });
}

await mkdir(standaloneNextDir, { recursive: true });
await replaceDir(path.join(root, "public"), path.join(standaloneDir, "public"));
await replaceDir(path.join(root, ".next", "static"), path.join(standaloneNextDir, "static"));

console.log("Standalone assets prepared.");
