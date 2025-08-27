// Server component wrapper that renders a client UI for the preview.
// Route: /preview/:projectId
import PreviewClient from "./preview.client";

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ instruction?: string }>;
}) {
  // In Next.js 15, params and searchParams are now promises
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Preview: {resolvedParams.projectId}</h1>
      <PreviewClient projectId={resolvedParams.projectId} />
    </main>
  );
}