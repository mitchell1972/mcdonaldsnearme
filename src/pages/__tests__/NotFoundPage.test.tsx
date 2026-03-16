import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { NotFoundPage } from '../NotFoundPage'

describe('NotFoundPage', () => {
  it('renders 404 heading', () => {
    render(<NotFoundPage />)
    expect(screen.getByRole('heading', { name: 'Page Not Found' })).toBeInTheDocument()
  })

  it('renders descriptive message', () => {
    render(<NotFoundPage />)
    expect(screen.getByText(/doesn't exist or has been moved/i)).toBeInTheDocument()
  })

  it('renders link back to home', () => {
    render(<NotFoundPage />)
    const homeLink = screen.getByRole('link', { name: /find mcdonald/i })
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders within Layout with proper structure', () => {
    render(<NotFoundPage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
