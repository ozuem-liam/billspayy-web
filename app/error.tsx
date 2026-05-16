'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-[#F8F7FF] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl mb-4">⚠️</p>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-500 mb-6">
            A critical error occurred. Please refresh the page.
          </p>
          <button
            onClick={reset}
            className="rounded-xl bg-[#6C3CE1] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5B32C7] transition-colors"
          >
            Refresh
          </button>
        </div>
      </body>
    </html>
  )
}
