import crypto from "node:crypto";
export type FileArtifact = { path: string; content: string };
export type Project = { id: string; plan?: any; files: FileArtifact[]; style?: { brandColor?: string; font?: string } };

const mem = new Map<string, Project>();

// Export for debugging
export const _mem = mem;

export function getOrCreateProject(id?: string) {
  const pid = id || crypto.randomUUID();
  if (!mem.has(pid)) mem.set(pid, { id: pid, files: [] });
  return mem.get(pid)!;
}

export function putProject(p: Project) { 
  mem.set(p.id, p); 
  return p; 
}

export function getProject(id: string) { 
  return mem.get(id) || null; 
}

export function getProjectOrCreate(id: string) {
  return mem.get(id) || getOrCreateProject(id); 
}

export function listFiles(id: string) { 
  return getProject(id).files; 
}

export function writeFiles(id: string, files: FileArtifact[]) {
  const p = getProject(id);
  // de-dupe by path
  const map = new Map<string, FileArtifact>(p.files.map(f => [f.path, f]));
  for (const f of files) map.set(f.path, f);
  p.files = Array.from(map.values());
  putProject(p);
  return p.files;
}