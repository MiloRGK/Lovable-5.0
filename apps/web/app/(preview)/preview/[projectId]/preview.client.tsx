"use client";

import { useEffect, useMemo, useState } from "react";

type FileRow = { path: string; sha?: string };
type DiffPatch = { path: string; diff: string };

export default function PreviewClient({ projectId }: { projectId: string }) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [files, setFiles] = useState<FileRow[]>([]);
  const [instruction, setInstruction] = useState("");
  const [patches, setPatches] = useState<DiffPatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string>("");

  async function refreshAll() {
    setLoading(true);
    try {
      const [u, f] = await Promise.all([
        fetch(`/api/preview-url?projectId=${projectId}`).then((r) => r.json()),
        fetch(`/api/files?projectId=${projectId}`).then((r) => r.json()),
      ]);
      setPreviewUrl(u.url);
      setFiles(f.files);
      setLog((s) => s + `\nRefreshed at ${new Date().toLocaleTimeString()}`);
    } finally {
      setLoading(false);
    }
  }

  async function runIterate() {
    if (!instruction.trim()) return;
    setLoading(true);
    setPatches([]);
    try {
      const res = await fetch(`/api/iterate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId, instruction }),
      });
      const data = await res.json();
      setPatches(data.patches || []);
      setLog((s) => s + `\nIterate: got ${data.patches?.length ?? 0} patch(es).`);
    } finally {
      setLoading(false);
    }
  }

  async function acceptAll() {
    if (!patches.length) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/files/apply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId, patches }),
      });
      const data = await res.json();
      setLog((s) => s + `\nApplied: ${data.applied ?? 0} file(s). Rebuilding preview...`);
      setPatches([]);
      await refreshAll();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const iframeSrc = useMemo(() => previewUrl || "/api/preview-fallback", [previewUrl]);

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
      {/* Left: Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Live preview</h2>
          <button
            className="rounded-md border px-3 py-1 text-sm"
            onClick={refreshAll}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
        <div className="rounded-xl border overflow-hidden">
          {/* The preview server (Vite/Next dev) should serve same-origin pages */}
          <iframe className="w-full aspect-[16/10]" src={iframeSrc} />
        </div>
        <div className="rounded-lg border p-3 text-sm bg-muted/30">
          <div className="font-medium mb-2">Build / Console</div>
          <pre className="whitespace-pre-wrap text-xs max-h-48 overflow-auto">
            {log || "No logs yet."}
          </pre>
        </div>
      </div>

      {/* Right: Files + Iterate */}
      <div className="space-y-4">
        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Project files</h3>
            <span className="text-xs text-muted-foreground">{files.length} files</span>
          </div>
          <ul className="text-sm max-h-52 overflow-auto">
            {files.map((f) => (
              <li key={f.path} className="py-1 border-b last:border-b-0">
                <code>{f.path}</code>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border p-3 space-y-2">
          <h3 className="font-medium">Iterative edit</h3>
          <p className="text-xs text-muted-foreground">
            Describe a change. We'll return a diff. You can accept it to update files.
          </p>
          <textarea
            className="w-full h-24 rounded-md border p-2 text-sm"
            placeholder='e.g., "Add a Status column to /invoices list"'
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border px-3 py-1 text-sm"
              onClick={runIterate}
              disabled={loading || !instruction.trim()}
            >
              Generate diff
            </button>
            <button
              className="rounded-md border px-3 py-1 text-sm"
              onClick={acceptAll}
              disabled={!patches.length || loading}
            >
              Accept all
            </button>
          </div>

          {!!patches.length && (
            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-2">
                {patches.length} change(s) proposed
              </div>
              <DiffList patches={patches} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DiffList({ patches }: { patches: DiffPatch[] }) {
  return (
    <div className="space-y-3">
      {patches.map((p) => (
        <div key={p.path} className="rounded-md border">
          <div className="px-2 py-1 text-xs bg-muted/40 font-mono">{p.path}</div>
          <pre className="p-2 text-[11px] overflow-auto max-h-40">
            {p.diff}
          </pre>
        </div>
      ))}
    </div>
  );
}