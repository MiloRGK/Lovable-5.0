import type { FileArtifact } from "../store";

/**
 * Naive unified diff apply:
 * - if both plus and minus exist, we replace file with only the '+' lines (no headers)
 * - if only minus lines exist, we delete the file
 * - if only plus lines exist, we create/replace with those
 * Good enough for MVP; upgrade later to a real patcher.
 */
export function applyUnifiedPatches(base: FileArtifact[], patches: { path: string; diff: string }[]) {
  const map = new Map(base.map(f => [f.path, f.content]));
  for (const p of patches) {
    const body = p.diff.split("\n").filter(l => l.startsWith("+") || l.startsWith("-"));
    const plus = body.filter(l => l.startsWith("+")).map(l => l.slice(1)).join("\n");
    const minus = body.filter(l => l.startsWith("-")).map(l => l.slice(1)).join("\n");
    if (plus && !minus) { map.set(p.path, plus); continue; }
    if (!plus && minus) { map.delete(p.path); continue; }
    if (plus && minus) { map.set(p.path, plus); continue; }
  }
  return Array.from(map, ([path, content]) => ({ path, content }));
}