import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, DollarSign, Phone, Globe } from 'lucide-react';
import { useRestaurant } from '@/hooks/useRestaurants';
import { trackRestaurantViewed } from '@/lib/tracking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RestaurantSchedule } from '@/components/restaurants/RestaurantSchedule';

/**
 * Restaurant Detail Page (A2 Screen)
 *
 * Displays detailed information about a single restaurant.
 *
 * Features:
 * - Dynamic route: /restaurant/:id
 * - TanStack Query integration for data fetching
 * - Loading and error states
 * - Timezone-aware schedule display
 * - Multi-currency support
 * - Tracking: RestaurantViewed event
 *
 * State Management:
 * - Server state via TanStack Query (cached)
 * - No URL params needed (only route param :id)
 * - No Jotai needed
 */
export const RestaurantDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Fetch restaurant data with TanStack Query
    const { data: restaurant, isLoading, error } = useRestaurant(id || '');

    // Track page view
    React.useEffect(() => {
        if (restaurant) {
            trackRestaurantViewed(restaurant.id, restaurant.name, restaurant.category);
        }
    }, [restaurant]);

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-96 bg-muted animate-pulse rounded-lg" />
                        <div className="h-48 bg-muted animate-pulse rounded-lg" />
                    </div>
                    <div className="space-y-6">
                        <div className="h-96 bg-muted animate-pulse rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-md mx-auto text-center space-y-4">
                    <div className="text-6xl">😞</div>
                    <h2 className="text-2xl font-bold">Restaurant not found</h2>
                    <p className="text-muted-foreground">
                        {error.message || "The restaurant you're looking for doesn't exist."}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => navigate(-1)} variant="outline">
                            Go Back
                        </Button>
                        <Link to="/">
                            <Button>Browse Restaurants</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!restaurant) return null;

    const priceSymbols = '$'.repeat(restaurant.priceLevel);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative h-96 rounded-lg overflow-hidden">
                        <img
                            src={restaurant.imageUrl}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                        />
                        {!restaurant.isOpenNow && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Badge
                                    variant="secondary"
                                    className="text-white bg-black/60 text-lg py-2 px-4"
                                >
                                    Currently Closed
                                </Badge>
                            </div>
                        )}
                    </div>
                    <Card>
                        <CardHeader>
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-3xl mb-2">
                                            {restaurant.name}
                                        </CardTitle>
                                        <p className="text-muted-foreground capitalize text-lg">
                                            {restaurant.category}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={restaurant.isOpenNow ? 'default' : 'secondary'}
                                        className="text-sm"
                                    >
                                        {restaurant.isOpenNow ? 'Open' : 'Closed'}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-base leading-relaxed">{restaurant.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    <div>
                                        <div className="font-semibold text-lg">
                                            {restaurant.rating.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {restaurant.reviewCount} reviews
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="font-semibold text-lg">{priceSymbols}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Price level
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="font-semibold text-lg">
                                            {restaurant.distanceKm.toFixed(1)} km
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Distance
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="font-semibold text-lg">
                                            {restaurant.country}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {restaurant.currency}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-wrap gap-2">
                                    {restaurant.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 border-t space-y-3">
                                <h3 className="font-semibold mb-3">Contact Information</h3>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span>{restaurant.address}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <a
                                        href={`tel:${restaurant.phone}`}
                                        className="text-primary hover:underline"
                                    >
                                        {restaurant.phone}
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <RestaurantSchedule
                        schedule={restaurant.schedule}
                        timezone={restaurant.timezone}
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Multi-tenant Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tenant ID:</span>
                                <span className="font-medium">{restaurant.tenantId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Country:</span>
                                <Badge variant="outline">{restaurant.country}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Currency:</span>
                                <Badge variant="outline">{restaurant.currency}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Timezone:</span>
                                <Badge variant="outline" className="text-xs">
                                    {restaurant.timezone}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                    <Button className="w-full" size="lg">
                        Make a Reservation
                    </Button>
                </div>
            </div>
        </div>
    );
};
