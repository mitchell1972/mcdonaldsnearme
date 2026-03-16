import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8" role="alert">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try again or refresh the page.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleRetry}
                className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
