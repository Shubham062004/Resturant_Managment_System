import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorLayout from '../../layouts/ErrorLayout';
import ServerErrorPage from '../../features/customer/pages/ServerErrorPage';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<any, any> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorLayout>
          <ServerErrorPage />
        </ErrorLayout>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
