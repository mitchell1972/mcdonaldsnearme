import { Helmet } from 'react-helmet-async'

export function SEOHead({ location }: { location: any }) {
  if (!location) return null
  
  const title = `${location.name} - ${location.address} | McDonald's Directory`
  const description = `Visit ${location.name} at ${location.address}. ${location.rating ? `Rated ${location.rating}/5 with ${location.reviews_count} reviews.` : ''} Opening hours, phone, and directions.`
  const image = location.photo || '/images/mcdonalds-default.jpg'
  const url = typeof window !== 'undefined' ? window.location.href : ''
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="restaurant" />
      <meta property="og:url" content={url} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Local Business Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Restaurant',
          name: location.name,
          image: image,
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
          telephone: location.phone,
          aggregateRating: location.rating ? {
            '@type': 'AggregateRating',
            ratingValue: location.rating,
            reviewCount: location.reviews_count
          } : undefined
        })}
      </script>
    </Helmet>
  )
}