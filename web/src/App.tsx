import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-background">
                <nav className="border-b">
                    <div className="container mx-auto px-4 py-4">
                        <h1 className="text-2xl font-bold">Mesa247</h1>
                    </div>
                </nav>

                <main className="container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

function HomePage() {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-4">Discover Restaurants</h2>
            <p className="text-muted-foreground">Restaurant list will be implemented here.</p>
            <div className="mt-4">
                <Link to="/restaurant/1" className="text-primary hover:underline">
                    → Go to restaurant detail (example)
                </Link>
            </div>
        </div>
    );
}

function RestaurantDetailPage() {
    return (
        <div>
            <Link to="/" className="text-primary hover:underline mb-4 inline-block">
                ← Back to list
            </Link>
            <h2 className="text-3xl font-bold mb-4">Restaurant Detail</h2>
            <p className="text-muted-foreground">Restaurant details will be implemented here.</p>
        </div>
    );
}

export default App;
