import { useState, useCallback, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'
import { Menu, X } from 'lucide-react'

interface SEOProps {
  title?: string
  description?: string
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  structuredData?: any
  noindex?: boolean
}

interface LayoutProps {
  children: ReactNode
  seo?: SEOProps
}

export function Layout({ children, seo }: LayoutProps) {
  const {
    title = 'McDonald\'s Locations in London | Find Your Nearest Restaurant',
    description = 'Find McDonald\'s restaurants near me in London. Search 285+ locations by postcode, area, or GPS. View opening hours, ratings, and get directions to your nearest McDonald\'s.',
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage = '/images/mcdonalds-og-image.jpg',
    ogType = 'website',
    twitterTitle,
    twitterDescription,
    twitterImage,
    structuredData,
    noindex = false
  } = seo || {}

  const currentUrl = typeof window !== 'undefined' ? window.location.href : canonicalUrl || ''
  const finalOgTitle = ogTitle || title
  const finalOgDescription = ogDescription || description
  const finalTwitterTitle = twitterTitle || finalOgTitle
  const finalTwitterDescription = twitterDescription || finalOgDescription
  const finalTwitterImage = twitterImage || ogImage

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <html lang="en" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#DA291C" />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

        {/* Open Graph Tags */}
        <meta property="og:title" content={finalOgTitle} />
        <meta property="og:description" content={finalOgDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:site_name" content="McDonald's Directory London" />
        <meta property="og:locale" content="en_GB" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={finalTwitterTitle} />
        <meta name="twitter:description" content={finalTwitterDescription} />
        <meta name="twitter:image" content={finalTwitterImage} />
        <meta name="twitter:site" content="@McDonalds" />

        {/* SEO Meta Tags */}
        <meta name="author" content="McDonald's Directory" />
        <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
        <meta name="geo.region" content="GB-ENG" />
        <meta name="geo.placename" content="London" />

        {/* Structured Data */}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
      </Helmet>

      {/* Skip Navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileMenuOpen])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/locations', label: 'All Locations' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-white border-b-2 border-yellow-400 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group" aria-label="McDonald's Directory - Home">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors" aria-hidden="true">
              <span className="text-yellow-400 font-bold text-xl">M</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 block">McDonald's Directory</span>
              <span className="text-sm text-gray-600 block">Find locations in London</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block" aria-label="Main navigation">
            <ul className="flex space-x-1">
              {navLinks.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive(link.to)
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                    aria-current={isActive(link.to) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-gray-100 transition-colors"
            onClick={toggleMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav id="mobile-menu" className="md:hidden pb-4 border-t border-gray-100" aria-label="Mobile navigation">
            <ul className="mt-2 space-y-1">
              {navLinks.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive(link.to)
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                    aria-current={isActive(link.to) ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center" aria-hidden="true">
                <span className="text-yellow-400 font-bold">M</span>
              </div>
              <span className="text-xl font-bold">McDonald's Directory</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Find your nearest McDonald's restaurant in London. Get directions, check opening hours, and discover what makes each location special.
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-4 text-lg">Quick Links</h2>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors focus-visible:text-white">Home</Link></li>
                <li><Link to="/locations" className="hover:text-white transition-colors focus-visible:text-white">All Locations</Link></li>
                <li>
                  <a
                    href="https://www.mcdonalds.com/gb/en-gb.html"
                    className="hover:text-white transition-colors focus-visible:text-white"
                    rel="noopener noreferrer"
                  >
                    McDonald's UK
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div>
            <h2 className="font-semibold mb-4 text-lg">Features</h2>
            <ul className="space-y-2 text-gray-400" aria-label="Site features">
              <li>Location Search</li>
              <li>Interactive Map</li>
              <li>Opening Hours</li>
              <li>Ratings & Reviews</li>
              <li>Directions</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} McDonald's Directory. This is an independent directory website. McDonald's is a registered trademark of McDonald's Corporation.</p>
        </div>
      </div>
    </footer>
  )
}
