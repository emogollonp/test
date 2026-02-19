import * as React from 'react';
import { Star, MapPin, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Restaurant } from '@/api/types';
import { cn } from '@/lib/utils';
import { usePrefetchRestaurant } from '@/hooks/useRestaurants';

interface RestaurantCardProps {
    restaurant: Restaurant;
    onClick?: () => void;
    onPrefetch?: (id: string) => void;
    className?: string;
}

export const RestaurantCard = React.memo<RestaurantCardProps>(
    ({ restaurant, onClick, onPrefetch, className }) => {
        const prefetchRestaurant = usePrefetchRestaurant();

        const priceSymbols = React.useMemo(
            () => '$'.repeat(restaurant.priceLevel),
            [restaurant.priceLevel]
        );

        const handleMouseEnter = React.useCallback(() => {
            prefetchRestaurant(restaurant.id);
            onPrefetch?.(restaurant.id);
        }, [prefetchRestaurant, restaurant.id, onPrefetch]);

        const handleFocus = React.useCallback(() => {
            prefetchRestaurant(restaurant.id);
        }, [prefetchRestaurant, restaurant.id]);

        return (
            <Card
                className={cn(
                    'cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]',
                    !restaurant.isOpenNow && 'opacity-75',
                    className
                )}
                onClick={onClick}
                onMouseEnter={handleMouseEnter}
                onFocus={handleFocus}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${restaurant.name}`}
            >
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                    {!restaurant.isOpenNow && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Badge variant="secondary" className="text-white bg-black/60">
                                Closed
                            </Badge>
                        </div>
                    )}
                </div>
                <CardContent className="p-4 space-y-3">
                    <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{restaurant.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                            {restaurant.category}
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {restaurant.description}
                    </p>
                    {restaurant.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {restaurant.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {restaurant.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{restaurant.tags.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                                <span className="text-muted-foreground">
                                    ({restaurant.reviewCount})
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                <span>{priceSymbols}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{restaurant.distanceKm.toFixed(1)} km</span>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        <span className="font-medium">{restaurant.country}</span>
                        {' • '}
                        <span>{restaurant.currency}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }
);

RestaurantCard.displayName = 'RestaurantCard';
