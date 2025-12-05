import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, Mail, Plane, Calendar, Clock, Users, Armchair } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BookingConfirmationProps {
  bookingData: any;
  flightData: any;
}

const BookingConfirmation = ({ bookingData, flightData }: BookingConfirmationProps) => {
  const navigate = useNavigate();
  const pnr = `${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const handleDownloadTicket = () => {
    // In real app, generate PDF
    alert("E-ticket download will be implemented with PDF generation");
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Message */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Your flight has been successfully booked
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Booking ID</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {bookingData.bookingId}
                </p>
              </div>
              <div className="w-px h-12 bg-green-300 dark:bg-green-700" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">PNR</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{pnr}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flight Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plane className="h-5 w-5 mr-2" />
            Flight Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-2">{flightData.flightNumber}</Badge>
              <div className="flex items-center space-x-4 text-lg">
                <div>
                  <p className="font-bold">{flightData.departureTime}</p>
                  <p className="text-sm text-muted-foreground">{flightData.from}</p>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <div className="w-16 h-px bg-border" />
                  <Plane className="h-4 w-4 mx-2" />
                  <div className="w-16 h-px bg-border" />
                </div>
                <div>
                  <p className="font-bold">{flightData.arrivalTime}</p>
                  <p className="text-sm text-muted-foreground">{flightData.to}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{flightData.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium">2h 30m</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Class</p>
                <p className="text-sm font-medium capitalize">{bookingData.fareClass}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passenger Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Passenger Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bookingData.passengers.map((passenger: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{passenger.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {passenger.gender} • {passenger.age} years
                  </p>
                </div>
                {bookingData.selectedSeats[passenger.fullName] && (
                  <div className="flex items-center space-x-2">
                    <Armchair className="h-4 w-4 text-primary" />
                    <Badge variant="secondary">
                      Seat {bookingData.selectedSeats[passenger.fullName]}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add-ons */}
      {bookingData.addons.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selected Add-ons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bookingData.addons.map((addon: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {addon.name} {addon.quantity > 1 && `x ${addon.quantity}`}
                  </span>
                  <span className="font-medium">${addon.price * addon.quantity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleDownloadTicket} className="flex-1 bg-gradient-sky text-white">
          <Download className="h-4 w-4 mr-2" />
          Download E-Ticket
        </Button>
        <Button variant="outline" className="flex-1">
          <Mail className="h-4 w-4 mr-2" />
          Email Ticket
        </Button>
      </div>

      {/* Info */}
      <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            What's Next?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• A confirmation email has been sent to your registered email address</li>
            <li>• Online check-in opens 24 hours before departure</li>
            <li>• Please arrive at the airport at least 2 hours before departure</li>
            <li>• Carry a valid photo ID for verification</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 text-center">
        <Button onClick={() => navigate("/my-trips")} variant="outline">
          View My Trips
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
