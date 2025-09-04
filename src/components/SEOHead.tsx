import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  location?: any
  isHomePage?: boolean
  pageType?: 'home' | 'location' | 'search' | 'list'
  searchQuery?: string
}

export function SEOHead({ location, isHomePage, pageType = 'location', searchQuery }: SEOHeadProps) {
  // Enhanced keyword-rich titles and descriptions for different page types
  const getPageMeta = () => {
    if (isHomePage) {
      return {
        title: "McDonald's Near Me | Find Nearest McDonald's & Closest McDonald's Locations",
        description: "Find McDonald's near me now. Search nearest McDonald's, closest McDonald's to my location, 24 hour McDonald's near me. Order McDonald's online, McDelivery near me, McDonald's DoorDash & Uber Eats. Real-time McDonald's hours near me.",
        keywords: "mcdonald's near me, mc donalds near me, nearest mcdonald's, closest mcdonald's, mcd near me, maccas near me, closest mcdonald's to me, order mcdonald's near me, mcdonald's near me now, mcdonald's near me now open, mcdelivery near me, 24 hour mcdonald's near me"
      }
    }
    
    if (pageType === 'search' && searchQuery) {
      return {
        title: `McDonald's Near ${searchQuery} | Closest McDonald's & Nearest Locations`,
        description: `Find McDonald's near ${searchQuery}. Discover the nearest McDonald's, closest McDonald's restaurants, 24 hour McDonald's locations. Order online, McDelivery, DoorDash & Uber Eats available.`,
        keywords: `mcdonald's near ${searchQuery}, nearest mcdonald's ${searchQuery}, closest mcdonald's ${searchQuery}`
      }
    }
    
    if (pageType === 'list') {
      return {
        title: "All McDonald's Locations Near Me | Complete McDonald's Restaurant Directory",
        description: "Browse all McDonald's locations near me. Find nearest McDonald's restaurant, closest McDonald's to my location, 24 hour McDonald's. McDonald's hours near me, deals, online ordering via DoorDash, Uber Eats & Just Eat.",
        keywords: "mcdonald's locations near me, mcdonald's restaurant near me, find mcdonald's near me, mcdonald's around me"
      }
    }
    
    if (location) {
      const area = location.city || location.address?.split(',')[1]?.trim() || 'this location'
      return {
        title: `${location.name} - McDonald's Near Me in ${area} | Nearest McDonald's Restaurant`,
        description: `${location.name} at ${location.address} - Closest McDonald's to you. ${location.rating ? `Rated ${location.rating}/5 with ${location.reviews_count} reviews.` : ''} McDonald's near me now open, order online, McDelivery, DoorDash & Uber Eats available. Opening hours, directions to nearest McDonald's.`,
        keywords: `mcdonald's near me ${area}, nearest mcdonald's ${area}, closest mcdonald's ${area}, mcdonald's ${location.postal_code}`
      }
    }
    
    return {
      title: "McDonald's Near Me | Find Nearest McDonald's",
      description: "Find McDonald's near me. Search nearest McDonald's, closest McDonald's locations.",
      keywords: "mcdonald's near me, nearest mcdonald's, closest mcdonald's"
    }
  }
  
  const meta = getPageMeta()
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const image = location?.photo || '/images/mcdonalds-og-image.jpg'
  
  // Enhanced structured data with comprehensive schema
  const getStructuredData = () => {
    const baseOrganization = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'McDonald\'s',
      url: 'https://www.mcdonalds.com',
      logo: 'https://www.mcdonalds.com/content/dam/sites/usa/nfl/icons/arches-logo_108x108.jpg',
      sameAs: [
        'https://www.facebook.com/McDonalds',
        'https://twitter.com/McDonalds',
        'https://www.instagram.com/mcdonalds',
        'https://www.youtube.com/user/McDonaldsUS'
      ]
    }
    
    if (isHomePage) {
      return [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'McDonald\'s Near Me Directory',
          description: 'Find McDonald\'s near me, nearest McDonald\'s, closest McDonald\'s to my location. Search 24 hour McDonald\'s, order online, McDelivery, DoorDash & Uber Eats.',
          url: url,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${url}search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        },
        baseOrganization,
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'How do I find the nearest McDonald\'s to my location?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use our McDonald\'s locator to find the nearest McDonald\'s. Enter your postcode or enable location services to find the closest McDonald\'s restaurants near you with real-time distance, directions, and opening hours.'
              }
            },
            {
              '@type': 'Question',
              name: 'Are there 24 hour McDonald\'s near me?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, many McDonald\'s locations operate 24 hours. Use our directory to filter for 24 hour McDonald\'s near you. Check individual restaurant pages for current opening hours as they may vary.'
              }
            },
            {
              '@type': 'Question',
              name: 'Can I order McDonald\'s online for delivery near me?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, you can order McDonald\'s for delivery through McDelivery, DoorDash, Uber Eats, and Just Eat. Check each McDonald\'s location page to see which delivery services are available near you.'
              }
            },
            {
              '@type': 'Question',
              name: 'How do I find McDonald\'s deals near me?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Find McDonald\'s deals and offers at locations near you through our directory. Each restaurant page shows current promotions, app deals, and special offers available at that specific McDonald\'s location.'
              }
            }
          ]
        }
      ]
    }
    
    if (location) {
      return {
        '@context': 'https://schema.org',
        '@type': 'FastFoodRestaurant',
        '@id': `${url}#restaurant`,
        name: location.name,
        image: image,
        url: url,
        telephone: location.phone,
        priceRange: '$',
        servesCuisine: 'Fast Food, Burgers, American',
        address: {
          '@type': 'PostalAddress',
          streetAddress: location.address,
          addressLocality: location.city,
          postalCode: location.postal_code,
          addressCountry: 'GB'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: location.latitude,
          longitude: location.longitude
        },
        openingHoursSpecification: location.opening_hours ? {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59'
        } : undefined,
        aggregateRating: location.rating ? {
          '@type': 'AggregateRating',
          ratingValue: location.rating,
          reviewCount: location.reviews_count,
          bestRating: '5',
          worstRating: '1'
        } : undefined,
        hasMenu: 'https://www.mcdonalds.com/gb/en-gb/menu.html',
        acceptsReservations: 'False',
        hasDeliveryService: true,
        hasTakeawayService: true,
        hasDriveThruService: true,
        amenityFeature: [
          { '@type': 'LocationFeatureSpecification', name: 'Wi-Fi', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Parking', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Drive-Thru', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'McCafé', value: true }
        ],
        parentOrganization: baseOrganization
      }
    }
    
    return baseOrganization
  }
  
  const structuredData = getStructuredData()
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{meta.title}</title>
      <meta name="title" content={meta.title} />
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <link rel="canonical" href={url} />
      
      {/* Geo Tags for Local SEO */}
      <meta name="geo.region" content="GB" />
      <meta name="geo.placename" content="United Kingdom" />
      <meta name="ICBM" content="51.5074, -0.1278" />
      <meta name="DC.title" content={meta.title} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={location ? "restaurant" : "website"} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="McDonald's Near Me Directory" />
      <meta property="og:locale" content="en_GB" />
      {location && (
        <>
          <meta property="restaurant:contact_info:street_address" content={location.address} />
          <meta property="restaurant:contact_info:locality" content={location.city} />
          <meta property="restaurant:contact_info:postal_code" content={location.postal_code} />
          <meta property="restaurant:contact_info:country_name" content="United Kingdom" />
          {location.phone && <meta property="restaurant:contact_info:phone_number" content={location.phone} />}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@McDonaldsUK" />
      <meta name="twitter:creator" content="@McDonaldsUK" />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Structured Data */}
      {Array.isArray(structuredData) ? (
        structuredData.map((data, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(data)}
          </script>
        ))
      ) : (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Breadcrumb Schema for Location Pages */}
      {location && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: typeof window !== 'undefined' ? window.location.origin : ''
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'McDonald\'s Locations',
                item: `${typeof window !== 'undefined' ? window.location.origin : ''}/locations`
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: location.name,
                item: url
              }
            ]
          })}
        </script>
      )}
    </Helmet>
  )
}
