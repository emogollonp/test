import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RestaurantsPage } from '@/pages/RestaurantsPage';
import { RestaurantDetailPage } from '@/pages/RestaurantDetailPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <div className="min-h-screen bg-background">
                        <nav className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
                            <div className="container mx-auto px-4 py-4">
                                <Link
                                    to="/"
                                    className="text-2xl font-bold hover:text-primary transition-colors"
                                >
                                    🍽️ Mesa247
                                </Link>
                            </div>
                        </nav>

                        <ErrorBoundary>
                            <Routes>
                                <Route path="/" element={<RestaurantsPage />} />
                                <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
                            </Routes>
                        </ErrorBoundary>
                    </div>
                </BrowserRouter>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;
