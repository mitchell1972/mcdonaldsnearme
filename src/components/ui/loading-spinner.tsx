interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export function LoadingSpinner({ size = 'md', className = '', label }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const defaultLabel = 'Loading'
  const accessibleLabel = label || defaultLabel

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} role="status">
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-red-600 ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      <span className={size === 'sm' ? 'sr-only' : 'text-gray-600'}>
        {accessibleLabel}...
      </span>
    </div>
  )
}
