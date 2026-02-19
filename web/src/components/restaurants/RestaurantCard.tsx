import * as React from 'react';
import { Star, MapPin, DollarSign, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Restaurant } from '@/api/types';
import { cn } from '@/lib/utils';
import { usePrefetchRestaurant } from '@/hooks/useRestaurants';
import { getExperiment } from '@/lib/experiments';

interface RestaurantCardProps {
    restaurant: Restaurant;
    onClick?: () => void;
    onPrefetch?: (id: string) => void;
    className?: string;
}

export const RestaurantCard = React.memo<RestaurantCardProps>(
    ({ restaurant, onClick, onPrefetch, className }) => {
        const prefetchRestaurant = usePrefetchRestaurant();

        const variant = React.useMemo(() => {
            return getExperiment('restaurant_card_variant');
        }, []);

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

        // Compact variant (original design)
        if (variant === 'compact') {
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
                            <h3 className="font-semibold text-lg line-clamp-1">
                                {restaurant.name}
                            </h3>
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
                                    <span className="font-medium">
                                        {restaurant.rating.toFixed(1)}
                                    </span>
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
                <div className="relative h-56 w-full overflow-hidden rounded-t-lg">
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
                    <div className="absolute top-3 right-3">
                        <Badge
                            variant={restaurant.isOpenNow ? 'default' : 'secondary'}
                            className="text-xs"
                        >
                            {restaurant.isOpenNow ? 'Open Now' : 'Closed'}
                        </Badge>
                    </div>
                </div>
                <CardContent className="p-5 space-y-4">
                    <div>
                        <h3 className="font-semibold text-xl line-clamp-1">{restaurant.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                            {restaurant.category}
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {restaurant.description}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <div className="flex items-center gap-1">
                                <span className="font-semibold">
                                    {restaurant.rating.toFixed(1)}
                                </span>
                                <span className="text-muted-foreground">
                                    ({restaurant.reviewCount})
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium">{priceSymbols}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{restaurant.distanceKm.toFixed(1)} km</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{restaurant.reviewCount} reviews</span>
                        </div>
                    </div>
                    {restaurant.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {restaurant.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {restaurant.tags.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                    +{restaurant.tags.length - 4} more
                                </Badge>
                            )}
                        </div>
                    )}
                    <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{restaurant.isOpenNow ? 'Open now' : 'Closed'}</span>
                        </div>
                        <div>
                            <span className="font-medium">{restaurant.country}</span>
                            {' • '}
                            <span>{restaurant.currency}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
);

RestaurantCard.displayName = 'RestaurantCard';
