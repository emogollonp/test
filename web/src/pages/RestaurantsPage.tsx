import * as React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RestaurantFilters } from '@/components/restaurants/RestaurantFilters';
import { MemoizedRestaurantList } from '@/components/restaurants/RestaurantList';
import { useRestaurantsInfinite } from '@/hooks/useRestaurants';
import { useDebounce } from '@/hooks/useDebounce';
import type { SearchFilters, SortOption, RestaurantCategory, Restaurant } from '@/api/types';
import { trackPageView, trackSearchPerformed } from '@/lib/tracking';

export const RestaurantsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const searchQuery = searchParams.get('q') || '';
    const sort = (searchParams.get('sort') as SortOption) || 'rating_desc';

    const filters: SearchFilters = React.useMemo(() => {
        const category = searchParams.get('category');
        const priceMin = searchParams.get('priceMin');
        const priceMax = searchParams.get('priceMax');
        const minRating = searchParams.get('minRating');
        const tags = searchParams.get('tags');
        const openNow = searchParams.get('openNow');

        return {
            category: category ? [category as RestaurantCategory] : undefined,
            priceRange: priceMin && priceMax ? [parseInt(priceMin), parseInt(priceMax)] : undefined,
            minRating: minRating ? parseFloat(minRating) : undefined,
            tags: tags ? tags.split(',') : undefined,
            openNow: openNow === 'true' ? true : undefined,
        };
    }, [searchParams]);

    const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);

    const updateUrlParams = React.useCallback(
        (updates: Record<string, string | undefined>) => {
            const newParams = new URLSearchParams(searchParams);

            Object.entries(updates).forEach(([key, value]) => {
                if (value === undefined || value === '') newParams.delete(key);
                else newParams.set(key, value);
            });

            setSearchParams(newParams);
        },
        [searchParams, setSearchParams]
    );

    const debouncedSearchQuery = useDebounce(localSearchQuery, 500);

    React.useEffect(() => {
        if (debouncedSearchQuery !== searchQuery) {
            updateUrlParams({ q: debouncedSearchQuery || undefined });
        }
    }, [debouncedSearchQuery, searchQuery, updateUrlParams]);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
        useRestaurantsInfinite({
            q: debouncedSearchQuery || undefined,
            filters,
            sort,
            pageSize: 12, // 12 per page for 3-column grid
        });

    React.useEffect(() => {
        if (debouncedSearchQuery) {
            const totalResults = data?.pages[0]?.total || 0;
            trackSearchPerformed(debouncedSearchQuery, totalResults);
        }
    }, [debouncedSearchQuery, data]);

    const allRestaurants = React.useMemo(() => {
        return data?.pages.flatMap((page) => page.items) || [];
    }, [data]);

    const totalCount = data?.pages[0]?.total;
    const currentPage = data?.pages.length || 1;

    const handleFiltersChange = React.useCallback(
        (newFilters: SearchFilters) => {
            updateUrlParams({
                category: newFilters.category?.[0],
                priceMin: newFilters.priceRange?.[0]?.toString(),
                priceMax: newFilters.priceRange?.[1]?.toString(),
                minRating: newFilters.minRating?.toString(),
                tags: newFilters.tags?.join(','),
                openNow: newFilters.openNow?.toString(),
            });
        },
        [updateUrlParams]
    );

    const handleSortChange = React.useCallback(
        (newSort: SortOption) => {
            updateUrlParams({ sort: newSort });
        },
        [updateUrlParams]
    );

    const handleReset = React.useCallback(() => {
        setLocalSearchQuery('');
        setSearchParams({});
    }, [setSearchParams]);

    const handleRestaurantClick = React.useCallback(
        (restaurant: Restaurant) => {
            navigate(`/restaurant/${restaurant.id}`);
        },
        [navigate]
    );

    React.useEffect(() => {
        trackPageView('restaurants_list');
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Find Your Perfect Restaurant</h1>
                <p className="text-muted-foreground">Discover the best restaurants in your area</p>
            </div>
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search restaurants, cuisines, or dishes..."
                        value={localSearchQuery}
                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                        className="pl-10 h-12 text-base"
                    />
                </div>
                {debouncedSearchQuery && debouncedSearchQuery !== localSearchQuery && (
                    <div className="text-xs text-muted-foreground mt-1">Searching...</div>
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <aside className="lg:col-span-1">
                    <RestaurantFilters
                        filters={filters}
                        sort={sort}
                        onFiltersChange={handleFiltersChange}
                        onSortChange={handleSortChange}
                        onReset={handleReset}
                    />
                </aside>
                <main className="lg:col-span-3">
                    {error ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">⚠️</div>
                            <h3 className="text-lg font-semibold mb-2">
                                Error loading restaurants
                            </h3>
                            <p className="text-muted-foreground">{error.message}</p>
                        </div>
                    ) : (
                        <MemoizedRestaurantList
                            restaurants={allRestaurants}
                            isLoading={isLoading || isFetchingNextPage}
                            hasMore={hasNextPage}
                            totalCount={totalCount}
                            currentPage={currentPage}
                            onLoadMore={() => fetchNextPage()}
                            onRestaurantClick={handleRestaurantClick}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};
