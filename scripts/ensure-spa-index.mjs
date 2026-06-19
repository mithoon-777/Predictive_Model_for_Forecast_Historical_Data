import { copyFile, mkdir, stat } from "node:fs/promises";
import { dirname } from "node:path";

const shellPath = "dist/client/_shell.html";
const indexPath = "dist/client/index.html";

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

if (await exists(shellPath)) {
  await mkdir(dirname(indexPath), { recursive: true });
  await copyFile(shellPath, indexPath);
}