import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

export interface FlightSegment {
  id: string;
  from: string;
  to: string;
  date: Date | undefined;
}

interface MultiCitySegmentProps {
  segment: FlightSegment;
  index: number;
  canRemove: boolean;
  onUpdate: (id: string, field: keyof FlightSegment, value: string | Date | undefined) => void;
  onRemove: (id: string) => void;
}

const MultiCitySegment = ({
  segment,
  index,
  canRemove,
  onUpdate,
  onRemove,
}: MultiCitySegmentProps) => {
  return (
    <div className="relative p-4 border border-border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
            {index + 1}
          </div>
          <span className="font-medium text-sm text-muted-foreground">Flight {index + 1}</span>
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(segment.id)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`from-${segment.id}`}>From</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
            <Input
              id={`from-${segment.id}`}
              placeholder="City or Airport"
              value={segment.from}
              onChange={(e) => onUpdate(segment.id, 'from', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`to-${segment.id}`}>To</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
            <Input
              id={`to-${segment.id}`}
              placeholder="City or Airport"
              value={segment.to}
              onChange={(e) => onUpdate(segment.id, 'to', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {segment.date ? format(segment.date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
              <Calendar
                mode="single"
                selected={segment.date}
                onSelect={(date) => onUpdate(segment.id, 'date', date)}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default MultiCitySegment;
