export type Restaurant = {
    id: string;
    name: string;
    description: string;
    category: RestaurantCategory;
    priceLevel: 1 | 2 | 3 | 4;
    rating: number;
    reviewCount: number;
    tags: string[];
    isOpenNow: boolean;
    distanceKm: number;
    imageUrl: string;
    tenantId: string;
    country: Country;
    currency: Currency;
    timezone: string;
    schedule: Schedule;
    address: string;
    phone: string;
};

export type RestaurantCategory =
    | 'italian'
    | 'mexican'
    | 'pizza'
    | 'asian'
    | 'burgers'
    | 'seafood'
    | 'vegetarian'
    | 'steakhouse'
    | 'cafe'
    | 'bakery'
    | 'sushi'
    | 'bbq';

export type Country = 'MX' | 'CO' | 'AR' | 'CL';

export type Currency = 'MXN' | 'COP' | 'ARS' | 'CLP';

export type Schedule = {
    [key in DayOfWeek]: TimeRange;
};

export type DayOfWeek =
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';

export type TimeRange = {
    open: string;
    close: string;
    closed?: boolean;
};

export type SearchFilters = {
    category?: RestaurantCategory[];
    priceRange?: [number, number]; // [min, max] from 1-4
    minRating?: number;
    tags?: string[];
    openNow?: boolean;
};

export type SortOption = 'rating_desc' | 'distance_asc' | 'price_asc';

export type SearchParams = {
    q?: string;
    filters?: SearchFilters;
    sort?: SortOption;
    page?: number;
    pageSize?: number;
};

export type PaginatedResponse<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
};

export type ApiError = {
    message: string;
    code: string;
    status: number;
};
