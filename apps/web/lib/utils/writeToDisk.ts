import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import type { FileArtifact } from "../store";

const ROOT = process.cwd();
const ENABLE = process.env.LOVELIER_WRITE_TO_FS === "1" && process.env.NODE_ENV !== "production";

export async function maybeWriteToDisk(files: FileArtifact[]) {
  if (!ENABLE) return { written: 0, enabled: false };
  let written = 0;
  for (const f of files) {
    const safe = normalize(f.path);
    if (safe.includes("..")) continue; // safety
    const abs = join(ROOT, safe);
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, f.content, "utf8");
    written++;
  }
  return { written, enabled: true };
}