import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RestaurantsPage } from '@/pages/RestaurantsPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <nav className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
            <div className="container mx-auto px-4 py-4">
              <Link to="/" className="text-2xl font-bold hover:text-primary transition-colors">
                🍽️ Mesa247
              </Link>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<RestaurantsPage />} />
            <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
          </Routes>
        </div>
      </BrowserRouter>
      
      {/* React Query Devtools - only in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function RestaurantDetailPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Link to="/" className="text-primary hover:underline mb-4 inline-block">
        ← Back to list
      </Link>
      <h2 className="text-3xl font-bold mb-4">Restaurant Detail</h2>
      <p className="text-muted-foreground">Restaurant details will be implemented here.</p>
    </main>
  );
}

export default App;
