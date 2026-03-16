import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import { Layout } from '../Layout'

describe('Layout', () => {
  it('renders children', () => {
    render(
      <Layout>
        <p>Test content</p>
      </Layout>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders skip navigation link', () => {
    render(
      <Layout>
        <p>Content</p>
      </Layout>
    )
    const skipLink = screen.getByText('Skip to main content')
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')
    expect(skipLink).toHaveClass('skip-link')
  })

  it('renders main element with correct id for skip nav', () => {
    render(
      <Layout>
        <p>Content</p>
      </Layout>
    )
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main-content')
  })

  it('renders header with navigation', () => {
    render(
      <Layout>
        <p>Content</p>
      </Layout>
    )
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })

  it('renders footer with contentinfo role', () => {
    render(
      <Layout>
        <p>Content</p>
      </Layout>
    )
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders nav links with proper aria attributes', () => {
    // Simulate being on home page
    window.history.pushState({}, '', '/')
    render(
      <Layout>
        <p>Content</p>
      </Layout>
    )
    const homeLink = screen.getAllByRole('link', { name: 'Home' })[0]
    expect(homeLink).toHaveAttribute('aria-current', 'page')
  })

  it('renders mobile menu button', () => {
    render(
      <Layout>
        <p>Content</p>
      </Layout>
    )
    const menuButton = screen.getByRole('button', { name: /navigation menu/i })
    expect(menuButton).toBeInTheDocument()
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles mobile menu on button click', () => {
    render(
      <Layout>
        <p>Content</p>
      </Layout>
    )
    const menuButton = screen.getByRole('button', { name: /navigation menu/i })

    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument()

    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes mobile menu on Escape key', () => {
    render(
      <Layout>
        <p>Content</p>
      </Layout>
    )
    const menuButton = screen.getByRole('button', { name: /navigation menu/i })

    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders footer navigation with accessible label', () => {
    render(
      <Layout>
        <p>Content</p>
      </Layout>
    )
    expect(screen.getByRole('navigation', { name: 'Footer navigation' })).toBeInTheDocument()
  })

  it('renders logo link with accessible label', () => {
    render(
      <Layout>
        <p>Content</p>
      </Layout>
    )
    expect(screen.getByRole('link', { name: /McDonald's Directory - Home/i })).toBeInTheDocument()
  })

  it('renders dynamic copyright year', () => {
    render(
      <Layout>
        <p>Content</p>
      </Layout>
    )
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument()
  })
})
