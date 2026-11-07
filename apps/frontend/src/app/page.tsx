export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-app">
      <div
        className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
      />
    </div>
  )
}
