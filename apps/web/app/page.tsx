export default function Home() {
  return (
    <main className="p-6 space-y-6">
      <div className="container mx-auto text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Lovable Clone</h1>
        <p className="text-lg text-muted-foreground">AI-powered full-stack web development platform</p>
        <div className="space-x-4">
          <a className="btn" href="/dashboard">Get Started</a>
          <a className="btn border-brand text-brand bg-transparent hover:bg-brand hover:text-white" href="/preview/demo">View Preview</a>
        </div>
      </div>
    </main>
  )
}