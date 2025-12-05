import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MultiCitySegment, { FlightSegment } from "@/components/search/MultiCitySegment";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

const MultiCitySearch = () => {
  const navigate = useNavigate();
  const [segments, setSegments] = useState<FlightSegment[]>([
    { id: uuidv4(), from: "", to: "", date: undefined },
    { id: uuidv4(), from: "", to: "", date: undefined },
  ]);

  const handleAddSegment = () => {
    if (segments.length >= 6) {
      toast.error("Maximum 6 flight segments allowed");
      return;
    }
    setSegments([...segments, { id: uuidv4(), from: "", to: "", date: undefined }]);
  };

  const handleRemoveSegment = (id: string) => {
    if (segments.length <= 2) {
      toast.error("Minimum 2 flight segments required");
      return;
    }
    setSegments(segments.filter((seg) => seg.id !== id));
  };

  const handleUpdateSegment = (
    id: string,
    field: keyof FlightSegment,
    value: string | Date | undefined
  ) => {
    setSegments(
      segments.map((seg) =>
        seg.id === id ? { ...seg, [field]: value } : seg
      )
    );
  };

  const handleSearch = () => {
    // Validate all segments
    const invalidSegments = segments.filter(
      (seg) => !seg.from || !seg.to || !seg.date
    );

    if (invalidSegments.length > 0) {
      toast.error("Please fill in all flight segment details");
      return;
    }

    // Check for logical route continuity
    for (let i = 0; i < segments.length - 1; i++) {
      const current = segments[i];
      const next = segments[i + 1];
      
      if (current.to.toLowerCase() !== next.from.toLowerCase()) {
        toast.warning(
          `Flight ${i + 1} destination (${current.to}) doesn't match Flight ${i + 2} origin (${next.from}). This may result in separate bookings.`
        );
      }

      // Check dates are in order
      if (current.date && next.date && current.date > next.date) {
        toast.error(`Flight ${i + 2} date cannot be before Flight ${i + 1} date`);
        return;
      }
    }

    // Encode segments for URL
    const segmentsParam = JSON.stringify(
      segments.map((seg) => ({
        from: seg.from,
        to: seg.to,
        date: seg.date ? format(seg.date, "yyyy-MM-dd") : "",
      }))
    );

    const params = new URLSearchParams({
      tripType: "multi-city",
      segments: segmentsParam,
    });

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Multi-City Flight Search</h1>
            <p className="text-muted-foreground">
              Book multiple flights in one itinerary. Add up to 6 destinations.
            </p>
          </div>

          <Card className="p-6 mb-6">
            <div className="space-y-4">
              {segments.map((segment, index) => (
                <MultiCitySegment
                  key={segment.id}
                  segment={segment}
                  index={index}
                  canRemove={segments.length > 2}
                  onUpdate={handleUpdateSegment}
                  onRemove={handleRemoveSegment}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleAddSegment}
                disabled={segments.length >= 6}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Flight
              </Button>
            </div>
          </Card>

          <div className="flex space-x-4">
            <Button
              onClick={handleSearch}
              className="flex-1 bg-gradient-sky text-white hover:opacity-90 text-lg h-12"
            >
              <Search className="mr-2 h-5 w-5" />
              Search Flights
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="h-12"
            >
              Cancel
            </Button>
          </div>

          {/* Tips */}
          <Card className="mt-6 p-6 bg-muted/50">
            <h3 className="font-semibold mb-3 flex items-center">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs mr-2">
                i
              </span>
              Multi-City Booking Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Each flight segment will be searched separately</li>
              <li>• Ensure arrival city matches the next departure city for connecting routes</li>
              <li>• Dates should be in chronological order</li>
              <li>• Some itineraries may require separate bookings</li>
              <li>• Consider layover time between flights when planning your route</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MultiCitySearch;
