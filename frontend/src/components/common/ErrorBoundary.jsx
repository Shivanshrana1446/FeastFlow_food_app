import { Component } from 'react';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <Icon name="alertTriangle" className="h-7 w-7" />
        </span>
        <h2 className="font-display text-xl font-bold text-ink-900">Something went wrong</h2>
        <p className="mt-2 max-w-md text-sm text-ink-500">
          This part of the page hit an unexpected error. You can try again, or head back home.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={this.handleReset}>
            Try again
          </Button>
          <Button to="/">Go home</Button>
        </div>
      </div>
    );
  }
}
