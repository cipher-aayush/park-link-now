import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MapPin, DollarSign, Clock, Car } from 'lucide-react';

interface FilterPanelProps {
  filters: {
    maxDistance: number;
    maxPrice: number;
    category: string;
    availability: boolean;
    sortBy: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, onClearFilters }) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Filters
        </h3>
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Clear All
        </Button>
      </div>

      {/* Distance Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Maximum Distance</Label>
        <div className="px-2">
          <Slider
            value={[filters.maxDistance]}
            onValueChange={(value) => updateFilter('maxDistance', value[0])}
            max={10000}
            min={100}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>100m</span>
            <span>{filters.maxDistance}m</span>
            <span>10km</span>
          </div>
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          Maximum Price per Hour
        </Label>
        <div className="px-2">
          <Slider
            value={[filters.maxPrice]}
            onValueChange={(value) => updateFilter('maxPrice', value[0])}
            max={200}
            min={5}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>₹5</span>
            <span>₹{filters.maxPrice}</span>
            <span>₹200</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-1">
          <Car className="w-4 h-4" />
          Parking Type
        </Label>
        <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select parking type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="covered">Covered Parking</SelectItem>
            <SelectItem value="open">Open Parking</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Availability Filter */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-1">
          <Clock className="w-4 h-4" />
          Available Now Only
        </Label>
        <Switch
          checked={filters.availability}
          onCheckedChange={(checked) => updateFilter('availability', checked)}
        />
      </div>

      {/* Sort Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Sort By</Label>
        <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose sorting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">Distance (Nearest First)</SelectItem>
            <SelectItem value="price">Price (Low to High)</SelectItem>
            <SelectItem value="rating">Rating (High to Low)</SelectItem>
            <SelectItem value="availability">Availability</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};

export default FilterPanel;