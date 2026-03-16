import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { ErrorBoundary } from '../ErrorBoundary'

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Working content</div>
}

describe('ErrorBoundary', () => {
  let originalConsoleError: typeof console.error

  beforeEach(() => {
    originalConsoleError = console.error
    console.error = vi.fn()
    // Prevent jsdom from reporting the error as unhandled
    vi.spyOn(window, 'addEventListener').mockImplementation(() => {})
  })

  afterEach(() => {
    console.error = originalConsoleError
    vi.restoreAllMocks()
  })

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Hello World</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('renders error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('has role="alert" on error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('provides recovery buttons', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Refresh Page' })).toBeInTheDocument()
  })

  it('does not expose raw error details to users', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.queryByText('Test error')).not.toBeInTheDocument()
  })
})
