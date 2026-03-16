import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { LoadingSpinner } from '../ui/loading-spinner'

describe('LoadingSpinner', () => {
  it('renders with default label', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders with custom label', () => {
    render(<LoadingSpinner label="Searching locations" />)
    expect(screen.getByText('Searching locations...')).toBeInTheDocument()
  })

  it('renders small size with sr-only label', () => {
    const { container } = render(<LoadingSpinner size="sm" />)
    const label = container.querySelector('.sr-only')
    expect(label).toBeInTheDocument()
    expect(label).toHaveTextContent('Loading...')
  })

  it('renders large size with visible label', () => {
    render(<LoadingSpinner size="lg" />)
    const label = screen.getByText('Loading...')
    expect(label).not.toHaveClass('sr-only')
  })

  it('has role="status" for screen readers', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('hides the spinner animation from screen readers', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.querySelector('[aria-hidden="true"]')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('animate-spin')
  })

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="mt-4" />)
    expect(container.firstChild).toHaveClass('mt-4')
  })
})
