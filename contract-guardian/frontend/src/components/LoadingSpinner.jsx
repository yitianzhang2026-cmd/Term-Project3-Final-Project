export default function LoadingSpinner() {
  return (
    <div className="flex h-full items-center justify-center py-20">
      <div className="inline-flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-brand-300 border-t-brand-700" />
    </div>
  )
}
