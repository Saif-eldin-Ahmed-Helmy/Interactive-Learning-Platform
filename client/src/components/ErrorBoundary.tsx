import { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Button, Alert } from 'react-bootstrap';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // TODO: You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
          <div className="text-center" style={{ maxWidth: '600px' }}>
            {/* Error Icon */}
            <div className="mb-4" style={{ fontSize: '5rem', color: '#dc3545' }}>
              <FaExclamationTriangle />
            </div>

            {/* Error Message */}
            <h1 className="mb-3">Oops! Something went wrong</h1>
            <p className="text-muted mb-4">
              We're sorry, but something unexpected happened. Don't worry, your progress has been saved.
            </p>

            {/* Error Details (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <Alert variant="danger" className="text-start mb-4">
                <Alert.Heading>Error Details (Development Only)</Alert.Heading>
                <p className="mb-2">
                  <strong>Message:</strong> {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details>
                    <summary style={{ cursor: 'pointer' }}>Component Stack</summary>
                    <pre className="mt-2" style={{ fontSize: '0.85rem', overflow: 'auto' }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="d-flex gap-3 justify-content-center">
              <Button
                variant="primary"
                size="lg"
                onClick={this.handleGoHome}
                className="d-flex align-items-center gap-2"
              >
                <FaHome />
                Go Home
              </Button>
              <Button
                variant="outline-secondary"
                size="lg"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-muted mt-4 small">
              If this problem persists, please contact support or try refreshing the page.
            </p>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}
