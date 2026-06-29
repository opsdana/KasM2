export default function LoadingSpinner({ size = 'md', text = 'Memuat data...' }) {
  const sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  }[size] || 'h-8 w-8 border-2'

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${sizeClass} animate-spin rounded-full border-gray-200 border-t-brand-secondary`} />
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  )
}
