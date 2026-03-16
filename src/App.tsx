import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { HomePage } from '@/pages/HomePage'
import { LocationPage } from '@/pages/LocationPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/location/:slug" element={<LocationPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  )
}
