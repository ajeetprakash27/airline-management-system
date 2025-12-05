import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plane, Users, Armchair, ShoppingBag, CreditCard, CheckCircle2 } from "lucide-react";
import PassengerDetailsStep from "@/components/booking/PassengerDetailsStep";
import SeatSelectionStep from "@/components/booking/SeatSelectionStep";
import AddonsStep from "@/components/booking/AddonsStep";
import PaymentStep from "@/components/booking/PaymentStep";
import BookingConfirmation from "@/components/booking/BookingConfirmation";

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    flightId: searchParams.get("flightId") || "",
    fareClass: searchParams.get("fareClass") || "economy",
    passengers: [] as any[],
    selectedSeats: {} as Record<string, string>,
    addons: [] as any[],
    paymentDetails: null as any,
    bookingId: null as string | null,
  });

  const steps = [
    { number: 1, title: "Passenger Details", icon: Users },
    { number: 2, title: "Seat Selection", icon: Armchair },
    { number: 3, title: "Add-ons", icon: ShoppingBag },
    { number: 4, title: "Payment", icon: CreditCard },
    { number: 5, title: "Confirmation", icon: CheckCircle2 },
  ];

  const progress = (currentStep / steps.length) * 100;

  const updateBookingData = (field: string, value: any) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Mock flight data - in real app, fetch from backend
  const flightData = {
    flightNumber: "SB101",
    from: searchParams.get("from") || "New York",
    to: searchParams.get("to") || "Los Angeles",
    departureTime: "08:00",
    arrivalTime: "10:30",
    date: searchParams.get("date") || "2025-12-10",
    economyPrice: 199,
    businessPrice: 499,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Flight Summary Header */}
        <Card className="p-6 mb-8 bg-gradient-sky text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Complete Your Booking</h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <Plane className="h-4 w-4 mr-1" />
                  {flightData.flightNumber} • {flightData.from} → {flightData.to}
                </span>
                <span>{flightData.departureTime} - {flightData.arrivalTime}</span>
                <span>{flightData.date}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Base Fare</p>
              <p className="text-3xl font-bold">
                ${bookingData.fareClass === "business" ? flightData.businessPrice : flightData.economyPrice}
              </p>
            </div>
          </div>
        </Card>

        {/* Progress Steps */}
        <div className="mb-8">
          <Progress value={progress} className="mb-4 h-2" />
          <div className="flex justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div
                  key={step.number}
                  className={`flex flex-col items-center ${
                    isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-muted"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <p className="text-xs text-center font-medium">{step.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && (
            <PassengerDetailsStep
              passengers={bookingData.passengers}
              onUpdate={(passengers) => updateBookingData("passengers", passengers)}
              onNext={nextStep}
            />
          )}

          {currentStep === 2 && (
            <SeatSelectionStep
              passengers={bookingData.passengers}
              selectedSeats={bookingData.selectedSeats}
              fareClass={bookingData.fareClass}
              onUpdate={(seats) => updateBookingData("selectedSeats", seats)}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 3 && (
            <AddonsStep
              passengers={bookingData.passengers}
              addons={bookingData.addons}
              onUpdate={(addons) => updateBookingData("addons", addons)}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 4 && (
            <PaymentStep
              bookingData={bookingData}
              flightData={flightData}
              onPaymentComplete={(paymentDetails, bookingId) => {
                updateBookingData("paymentDetails", paymentDetails);
                updateBookingData("bookingId", bookingId);
                nextStep();
              }}
              onBack={prevStep}
            />
          )}

          {currentStep === 5 && (
            <BookingConfirmation
              bookingData={bookingData}
              flightData={flightData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
