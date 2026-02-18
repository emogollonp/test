import * as React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { SearchFilters, SortOption, RestaurantCategory } from '@/api/types';
import { getCategories, getTags } from '@/api/fake-api';
import { trackFilterApplied, trackSortChanged } from '@/lib/tracking';

const CATEGORIES = getCategories();
const ALL_TAGS = getTags();
const POPULAR_TAGS = ['delivery', 'terraza', 'romántico', 'familiar', 'vegano', 'económico'];

interface RestaurantFiltersProps {
    filters: SearchFilters;
    sort: SortOption;
    onFiltersChange: (filters: SearchFilters) => void;
    onSortChange: (sort: SortOption) => void;
    onReset: () => void;
    className?: string;
}

export const RestaurantFilters: React.FC<RestaurantFiltersProps> = ({
    filters,
    sort,
    onFiltersChange,
    onSortChange,
    onReset,
    className,
}) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [tagSearchQuery, setTagSearchQuery] = React.useState('');

    // Filter tags based on search query
    const filteredTags = React.useMemo(() => {
        if (!tagSearchQuery) return POPULAR_TAGS;
        return ALL_TAGS.filter((tag) =>
            tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
        ).slice(0, 20);
    }, [tagSearchQuery]);

    // Check if any filters are active
    const hasActiveFilters = React.useMemo(() => {
        return (
            (filters.category && filters.category.length > 0) ||
            filters.priceRange?.[0] !== 1 ||
            filters.priceRange?.[1] !== 4 ||
            filters.minRating !== undefined ||
            (filters.tags && filters.tags.length > 0) ||
            filters.openNow !== undefined
        );
    }, [filters]);

    const handleCategoryChange = (value: string) => {
        const newCategories = value === 'all' ? undefined : [value as RestaurantCategory];
        onFiltersChange({ ...filters, category: newCategories });
        trackFilterApplied('category', value);
    };

    const handlePriceRangeChange = (value: number[]) => {
        onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
        trackFilterApplied('price_range', `${value[0]}-${value[1]}`);
    };

    const handleMinRatingChange = (value: string) => {
        const rating = parseFloat(value);
        onFiltersChange({ ...filters, minRating: rating === 0 ? undefined : rating });
        trackFilterApplied('min_rating', rating);
    };

    const handleTagToggle = (tag: string) => {
        const currentTags = filters.tags || [];
        const newTags = currentTags.includes(tag)
            ? currentTags.filter((t) => t !== tag)
            : [...currentTags, tag];
        onFiltersChange({ ...filters, tags: newTags.length > 0 ? newTags : undefined });
        trackFilterApplied('tags', tag);
    };

    const handleOpenNowChange = (checked: boolean) => {
        onFiltersChange({ ...filters, openNow: checked || undefined });
        trackFilterApplied('open_now', checked);
    };

    const handleSortChange = (value: SortOption) => {
        onSortChange(value);
        trackSortChanged(value);
    };

    const handleReset = () => {
        onReset();
        setTagSearchQuery('');
    };

    return (
        <Card className={className}>
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5" />
                        <h2 className="font-semibold text-lg">Filters</h2>
                        {hasActiveFilters && (
                            <Badge variant="secondary">{Object.keys(filters).length} active</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="lg:hidden"
                        >
                            {isExpanded ? 'Hide' : 'Show'}
                        </Button>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={handleReset}>
                                <X className="h-4 w-4 mr-1" />
                                Reset
                            </Button>
                        )}
                    </div>
                </div>

                <div className={`space-y-4 ${!isExpanded && 'hidden lg:block'}`}>
                    <div className="space-y-2">
                        <Label>Sort by</Label>
                        <Select value={sort} onValueChange={handleSortChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="rating_desc">⭐ Best rated</SelectItem>
                                <SelectItem value="distance_asc">📍 Nearest</SelectItem>
                                <SelectItem value="price_asc">💰 Cheapest</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={filters.category?.[0] || 'all'}
                            onValueChange={handleCategoryChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                {CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>
                            Price range: {'$'.repeat(filters.priceRange?.[0] || 1)} -{' '}
                            {'$'.repeat(filters.priceRange?.[1] || 4)}
                        </Label>
                        <Slider
                            min={1}
                            max={4}
                            step={1}
                            value={filters.priceRange || [1, 4]}
                            onValueChange={handlePriceRangeChange}
                            className="py-4"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Minimum rating</Label>
                        <Select
                            value={String(filters.minRating || 0)}
                            onValueChange={handleMinRatingChange}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Any rating</SelectItem>
                                <SelectItem value="3">⭐ 3.0+</SelectItem>
                                <SelectItem value="3.5">⭐ 3.5+</SelectItem>
                                <SelectItem value="4">⭐ 4.0+</SelectItem>
                                <SelectItem value="4.5">⭐ 4.5+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <Input
                            type="text"
                            placeholder="Search tags..."
                            value={tagSearchQuery}
                            onChange={(e) => setTagSearchQuery(e.target.value)}
                            className="mb-2"
                        />
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                            {filteredTags.map((tag) => {
                                const isSelected = filters.tags?.includes(tag);
                                return (
                                    <Badge
                                        key={tag}
                                        variant={isSelected ? 'default' : 'outline'}
                                        className="cursor-pointer hover:bg-primary/80"
                                        onClick={() => handleTagToggle(tag)}
                                    >
                                        {tag}
                                        {isSelected && <X className="h-3 w-3 ml-1" />}
                                    </Badge>
                                );
                            })}
                        </div>
                        {filters.tags && filters.tags.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                                {filters.tags.length} tag(s) selected
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="open-now">Open now</Label>
                        <Switch
                            id="open-now"
                            checked={filters.openNow || false}
                            onCheckedChange={handleOpenNowChange}
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};
