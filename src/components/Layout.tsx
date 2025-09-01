import { Helmet } from 'react-helmet-async'
import { ReactNode } from 'react'

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
    description = 'Find McDonald\'s restaurants near you in London. Search 285+ locations by postcode, area, or GPS. View opening hours, ratings, and get directions to your nearest McDonald\'s.',
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
    <div className="min-h-screen bg-white">
      <Helmet>
        {/* Basic Meta Tags */}
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
        
        {/* Additional SEO Meta Tags */}
        <meta name="author" content="McDonald's Directory" />
        <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
        <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
        <meta name="geo.region" content="GB-ENG" />
        <meta name="geo.placename" content="London" />
        
        {/* Structured Data */}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
      </Helmet>
      
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  return (
    <header className="bg-white border-b-2 border-yellow-400 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {/* McDonald's Logo */}
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-yellow-400 font-bold text-xl">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">McDonald's Directory</h1>
              <p className="text-sm text-gray-600">Find locations in London</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
              Home
            </a>
            <a href="/locations" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
              All Locations
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-yellow-400 font-bold">M</span>
              </div>
              <h3 className="text-xl font-bold">McDonald's Directory</h3>
            </div>
            <p className="text-gray-400 max-w-md">
              Find your nearest McDonald's restaurant in London. Get directions, check opening hours, and discover what makes each location special.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/locations" className="hover:text-white transition-colors">All Locations</a></li>
              <li><a href="https://www.mcdonalds.com/gb/en-gb.html" className="hover:text-white transition-colors">McDonald's UK</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Location Search</li>
              <li>Interactive Map</li>
              <li>Opening Hours</li>
              <li>Ratings & Reviews</li>
              <li>Directions</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 McDonald's Directory. This is an independent directory website. McDonald's is a registered trademark of McDonald's Corporation.</p>
        </div>
      </div>
    </footer>
  )
}