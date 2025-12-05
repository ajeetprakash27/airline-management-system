import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";

interface FlightFiltersProps {
  airlines: string[];
  selectedAirlines: string[];
  onAirlineChange: (airlines: string[]) => void;
  priceRange: [number, number];
  maxPrice: number;
  onPriceChange: (range: [number, number]) => void;
  selectedStops: string[];
  onStopsChange: (stops: string[]) => void;
  timeRanges: {
    departure: string[];
    arrival: string[];
  };
  onTimeRangeChange: (type: 'departure' | 'arrival', ranges: string[]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

const FlightFilters = ({
  airlines,
  selectedAirlines,
  onAirlineChange,
  priceRange,
  maxPrice,
  onPriceChange,
  selectedStops,
  onStopsChange,
  timeRanges,
  onTimeRangeChange,
  sortBy,
  onSortChange,
  onReset,
  activeFiltersCount,
}: FlightFiltersProps) => {
  const stopOptions = [
    { value: "0", label: "Non-stop" },
    { value: "1", label: "1 Stop" },
    { value: "2+", label: "2+ Stops" },
  ];

  const timeSlots = [
    { value: "early", label: "Early Morning", time: "00:00 - 06:00" },
    { value: "morning", label: "Morning", time: "06:00 - 12:00" },
    { value: "afternoon", label: "Afternoon", time: "12:00 - 18:00" },
    { value: "evening", label: "Evening", time: "18:00 - 24:00" },
  ];

  const sortOptions = [
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "departure-asc", label: "Departure: Earliest First" },
    { value: "departure-desc", label: "Departure: Latest First" },
    { value: "duration-asc", label: "Duration: Shortest First" },
    { value: "duration-desc", label: "Duration: Longest First" },
  ];

  const handleAirlineToggle = (airline: string) => {
    if (selectedAirlines.includes(airline)) {
      onAirlineChange(selectedAirlines.filter((a) => a !== airline));
    } else {
      onAirlineChange([...selectedAirlines, airline]);
    }
  };

  const handleStopToggle = (stop: string) => {
    if (selectedStops.includes(stop)) {
      onStopsChange(selectedStops.filter((s) => s !== stop));
    } else {
      onStopsChange([...selectedStops, stop]);
    }
  };

  const handleTimeToggle = (type: 'departure' | 'arrival', slot: string) => {
    const current = timeRanges[type];
    if (current.includes(slot)) {
      onTimeRangeChange(type, current.filter((s) => s !== slot));
    } else {
      onTimeRangeChange(type, [...current, slot]);
    }
  };

  return (
    <Card className="p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <Separator className="mb-4" />

      {/* Sort By */}
      <div className="mb-6">
        <Label className="text-sm font-semibold mb-3 block">Sort By</Label>
        <RadioGroup value={sortBy} onValueChange={onSortChange}>
          {sortOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="cursor-pointer text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator className="mb-4" />

      {/* Stops */}
      <div className="mb-6">
        <Label className="text-sm font-semibold mb-3 block">Stops</Label>
        <div className="space-y-2">
          {stopOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`stop-${option.value}`}
                checked={selectedStops.includes(option.value)}
                onCheckedChange={() => handleStopToggle(option.value)}
              />
              <Label
                htmlFor={`stop-${option.value}`}
                className="cursor-pointer text-sm"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Price Range */}
      <div className="mb-6">
        <Label className="text-sm font-semibold mb-3 block">
          Price Range (${priceRange[0]} - ${priceRange[1]})
        </Label>
        <Slider
          min={0}
          max={maxPrice}
          step={50}
          value={priceRange}
          onValueChange={(value) => onPriceChange(value as [number, number])}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$0</span>
          <span>${maxPrice}</span>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Airlines */}
      {airlines.length > 0 && (
        <>
          <div className="mb-6">
            <Label className="text-sm font-semibold mb-3 block">Airlines</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {airlines.map((airline) => (
                <div key={airline} className="flex items-center space-x-2">
                  <Checkbox
                    id={`airline-${airline}`}
                    checked={selectedAirlines.includes(airline)}
                    onCheckedChange={() => handleAirlineToggle(airline)}
                  />
                  <Label
                    htmlFor={`airline-${airline}`}
                    className="cursor-pointer text-sm"
                  >
                    {airline}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <Separator className="mb-4" />
        </>
      )}

      {/* Departure Time */}
      <div className="mb-6">
        <Label className="text-sm font-semibold mb-3 block">
          Departure Time
        </Label>
        <div className="space-y-2">
          {timeSlots.map((slot) => (
            <div key={slot.value} className="flex items-center space-x-2">
              <Checkbox
                id={`dep-${slot.value}`}
                checked={timeRanges.departure.includes(slot.value)}
                onCheckedChange={() => handleTimeToggle('departure', slot.value)}
              />
              <Label
                htmlFor={`dep-${slot.value}`}
                className="cursor-pointer text-sm flex-1"
              >
                <span className="block">{slot.label}</span>
                <span className="text-xs text-muted-foreground">{slot.time}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Arrival Time */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Arrival Time</Label>
        <div className="space-y-2">
          {timeSlots.map((slot) => (
            <div key={slot.value} className="flex items-center space-x-2">
              <Checkbox
                id={`arr-${slot.value}`}
                checked={timeRanges.arrival.includes(slot.value)}
                onCheckedChange={() => handleTimeToggle('arrival', slot.value)}
              />
              <Label
                htmlFor={`arr-${slot.value}`}
                className="cursor-pointer text-sm flex-1"
              >
                <span className="block">{slot.label}</span>
                <span className="text-xs text-muted-foreground">{slot.time}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default FlightFilters;
