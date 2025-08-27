export default function Dashboard() {
  return (
    <main className="p-6 space-y-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <div className="space-y-2">
              <a href="/api/plan" className="btn w-full">Generate Plan</a>
              <a href="/preview/demo" className="btn w-full border-brand text-brand bg-transparent hover:bg-brand hover:text-white">
                View Preview
              </a>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="py-2 border-b">Invoice Tracker (Demo)</div>
              <div className="py-2 border-b">E-commerce Store (Draft)</div>
              <div className="py-2">Blog Platform (Archived)</div>
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">System Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>API Status</span>
                <span className="text-green-600">✓ Online</span>
              </div>
              <div className="flex justify-between">
                <span>Preview Server</span>
                <span className="text-green-600">✓ Ready</span>
              </div>
              <div className="flex justify-between">
                <span>Build Pipeline</span>
                <span className="text-green-600">✓ Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <div className="space-y-3 text-sm">
            <p>Welcome to your Lovable Clone! Here's how to build your first app:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Describe your app idea in natural language</li>
              <li>Generate a plan with entities and pages</li>
              <li>Scaffold the code automatically</li>
              <li>Preview and iterate with AI assistance</li>
              <li>Deploy with one click</li>
            </ol>
            <div className="mt-4">
              <a href="/preview/demo" className="btn">Try the Demo</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}