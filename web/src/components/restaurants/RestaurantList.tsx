import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RestaurantCard } from './RestaurantCard';
import type { Restaurant } from '@/api/types';
import { trackLoadMoreClicked } from '@/lib/tracking/helpers';

interface RestaurantListProps {
    restaurants: Restaurant[];
    isLoading?: boolean;
    hasMore?: boolean;
    totalCount?: number;
    currentPage?: number;
    onLoadMore?: () => void;
    onRestaurantClick?: (restaurant: Restaurant, index: number) => void;
    className?: string;
}

export const RestaurantList: React.FC<RestaurantListProps> = ({
    restaurants,
    isLoading,
    hasMore,
    totalCount,
    currentPage,
    onLoadMore,
    onRestaurantClick,
    className,
}) => {
    const handleRestaurantClick = React.useCallback(
        (restaurant: Restaurant, index: number) => {
            onRestaurantClick?.(restaurant, index);
        },
        [onRestaurantClick]
    );

    const handleLoadMore = React.useCallback(() => {
        if (hasMore && onLoadMore && currentPage) {
            trackLoadMoreClicked(currentPage, totalCount || 0, restaurants.length);
            onLoadMore();
        }
    }, [hasMore, onLoadMore, currentPage, totalCount, restaurants.length]);

    if (!isLoading && restaurants.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">No restaurants found</h3>
                <p className="text-muted-foreground max-w-md">
                    Try adjusting your filters or search query to find more restaurants.
                </p>
            </div>
        );
    }

    return (
        <div className={className}>
            {totalCount !== undefined && (
                <div className="mb-4 text-sm text-muted-foreground">
                    Showing {restaurants.length} of {totalCount} restaurants
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant, index) => (
                    <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onClick={() => handleRestaurantClick(restaurant, index)}
                    />
                ))}
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading restaurants...</span>
                </div>
            )}

            {!isLoading && hasMore && (
                <div className="flex justify-center mt-8">
                    <Button onClick={handleLoadMore} size="lg" variant="outline">
                        Load More
                    </Button>
                </div>
            )}
            {!isLoading && !hasMore && restaurants.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p>You&#39;ve reached the end of the list</p>
                </div>
            )}
        </div>
    );
};

export const MemoizedRestaurantList = React.memo(RestaurantList);
