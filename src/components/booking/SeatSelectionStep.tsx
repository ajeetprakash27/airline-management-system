import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Armchair, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SeatSelectionStepProps {
  passengers: any[];
  selectedSeats: Record<string, string>;
  fareClass: string;
  onUpdate: (seats: Record<string, string>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SeatSelectionStep = ({
  passengers,
  selectedSeats,
  fareClass,
  onUpdate,
  onNext,
  onBack,
}: SeatSelectionStepProps) => {
  const [localSeats, setLocalSeats] = useState(selectedSeats);
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0);

  // Mock seat layout (6 seats per row, 10 rows)
  const rows = fareClass === "business" ? 4 : 10;
  const seatsPerRow = fareClass === "business" ? 4 : 6;
  const columns = fareClass === "business" ? ["A", "B", "C", "D"] : ["A", "B", "C", "D", "E", "F"];

  // Mock booked seats
  const bookedSeats = ["2A", "2B", "3C", "5D", "7A", "7F"];

  const isSeatBooked = (seat: string) => bookedSeats.includes(seat);
  const isSeatSelected = (seat: string) => Object.values(localSeats).includes(seat);
  const isSeatSelectedByCurrentPassenger = (seat: string) =>
    localSeats[passengers[currentPassengerIndex]?.fullName] === seat;

  const handleSeatClick = (seat: string) => {
    if (isSeatBooked(seat)) {
      toast({
        title: "Seat Unavailable",
        description: "This seat is already booked",
        variant: "destructive",
      });
      return;
    }

    const passengerName = passengers[currentPassengerIndex]?.fullName;
    const updated = { ...localSeats };

    if (isSeatSelectedByCurrentPassenger(seat)) {
      delete updated[passengerName];
    } else {
      updated[passengerName] = seat;
      // Auto-advance to next passenger if not the last one
      if (currentPassengerIndex < passengers.length - 1) {
        setTimeout(() => setCurrentPassengerIndex(currentPassengerIndex + 1), 300);
      }
    }

    setLocalSeats(updated);
  };

  const handleNext = () => {
    if (Object.keys(localSeats).length !== passengers.length) {
      toast({
        title: "Incomplete Selection",
        description: "Please select seats for all passengers",
        variant: "destructive",
      });
      return;
    }

    onUpdate(localSeats);
    onNext();
  };

  const getSeatColor = (seat: string) => {
    if (isSeatBooked(seat)) return "bg-muted text-muted-foreground cursor-not-allowed";
    if (isSeatSelectedByCurrentPassenger(seat)) return "bg-primary text-primary-foreground";
    if (isSeatSelected(seat)) return "bg-green-500 text-white";
    return "bg-white border-2 border-border hover:border-primary cursor-pointer";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Armchair className="h-5 w-5 mr-2" />
          Select Your Seats
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Passenger Selector */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Selecting seat for:</h3>
          <div className="flex flex-wrap gap-2">
            {passengers.map((passenger, index) => (
              <Button
                key={index}
                variant={currentPassengerIndex === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPassengerIndex(index)}
                className={currentPassengerIndex === index ? "bg-gradient-sky" : ""}
              >
                {passenger.fullName}
                {localSeats[passenger.fullName] && (
                  <Badge variant="secondary" className="ml-2">
                    {localSeats[passenger.fullName]}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-white border-2 border-border rounded mr-2" />
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-primary rounded mr-2" />
            <span>Your Selection</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-500 rounded mr-2" />
            <span>Other Passengers</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-muted rounded mr-2" />
            <span>Booked</span>
          </div>
        </div>

        {/* Seat Map */}
        <div className="bg-muted/30 p-6 rounded-lg overflow-x-auto">
          {/* Cockpit */}
          <div className="text-center mb-4">
            <div className="inline-block bg-primary/10 px-6 py-2 rounded-t-full">
              <span className="text-sm font-medium text-muted-foreground">Cockpit</span>
            </div>
          </div>

          {/* Seats */}
          <div className="space-y-3">
            {Array.from({ length: rows }, (_, rowIndex) => {
              const rowNumber = rowIndex + 1;
              return (
                <div key={rowNumber} className="flex items-center justify-center space-x-2">
                  <span className="w-8 text-center text-sm font-medium text-muted-foreground">
                    {rowNumber}
                  </span>

                  {columns.map((col, colIndex) => {
                    const seat = `${rowNumber}${col}`;
                    const isAisle = fareClass === "business"
                      ? colIndex === 1
                      : colIndex === 2;

                    return (
                      <div key={col} className="flex items-center">
                        <button
                          onClick={() => handleSeatClick(seat)}
                          disabled={isSeatBooked(seat)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${getSeatColor(
                            seat
                          )}`}
                        >
                          {col}
                        </button>
                        {isAisle && <div className="w-6" />}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex items-start">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Window seats (A, F) and aisle seats (C, D) are most popular. Middle seats may have extra legroom on some rows.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleNext} className="bg-gradient-sky text-white hover:opacity-90">
            Continue to Add-ons
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeatSelectionStep;
