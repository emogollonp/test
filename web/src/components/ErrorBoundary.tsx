import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { errorTracker } from '@/lib/telemetry';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * In production:
 * - Sends error reports to Sentry
 * - Logs to error monitoring service
 * - Shows user-friendly error message
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Report to error tracking service (Sentry)
        errorTracker.captureException(error, {
            component: 'ErrorBoundary',
            extra: {
                componentStack: errorInfo.componentStack,
            },
        });

        if (import.meta.env?.MODE === 'development') {
            console.error('🚨 [ErrorBoundary] Caught an error:', error);
            console.error('Component stack:', errorInfo.componentStack);
        }
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render(): React.ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
                    <Card className="max-w-lg w-full">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle className="h-8 w-8 text-destructive" />
                                <CardTitle className="text-2xl">Something went wrong</CardTitle>
                            </div>
                            <CardDescription>
                                An unexpected error occurred. We&apos;ve been notified and are
                                working to fix it.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {import.meta.env?.MODE === 'development' && this.state.error && (
                                <details className="text-sm">
                                    <summary className="cursor-pointer font-medium mb-2 text-muted-foreground hover:text-foreground">
                                        Error details (development only)
                                    </summary>
                                    <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                                        <code>{this.state.error.toString()}</code>
                                    </pre>
                                    {this.state.error.stack && (
                                        <pre className="bg-muted p-4 rounded-md overflow-auto text-xs mt-2">
                                            <code>{this.state.error.stack}</code>
                                        </pre>
                                    )}
                                </details>
                            )}
                            <div className="flex gap-3">
                                <Button onClick={this.handleReset} variant="default">
                                    Try Again
                                </Button>
                                <Button
                                    onClick={() => (window.location.href = '/')}
                                    variant="outline"
                                >
                                    Go to Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }
        return this.props.children;
    }
}

export function useErrorHandler(): (error: Error) => void {
    return (error: Error) => {
        errorTracker.captureException(error, {
            component: 'useErrorHandler',
        });
        if (import.meta.env?.MODE === 'development') console.error('[useErrorHandler]', error);
        throw error;
    };
}
