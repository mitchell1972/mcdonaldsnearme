import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { MapPin } from 'lucide-react'

export function NotFoundPage() {
  return (
    <Layout seo={{ title: 'Page Not Found - McDonald\'s Directory', noindex: true }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-6" aria-hidden="true" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Find McDonald's Near Me
        </Link>
      </div>
    </Layout>
  )
}
