import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Wallet, Building2, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PaymentStepProps {
  bookingData: any;
  flightData: any;
  onPaymentComplete: (paymentDetails: any, bookingId: string) => void;
  onBack: () => void;
}

const PaymentStep = ({ bookingData, flightData, onPaymentComplete, onBack }: PaymentStepProps) => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [processing, setProcessing] = useState(false);

  const baseFare = bookingData.fareClass === "business" 
    ? flightData.businessPrice 
    : flightData.economyPrice;
  
  const totalBaseFare = baseFare * bookingData.passengers.length;
  const taxes = totalBaseFare * 0.15; // 15% tax
  const addonsCost = bookingData.addons.reduce((sum: number, addon: any) => 
    sum + addon.price * addon.quantity, 0);
  const totalAmount = totalBaseFare + taxes + addonsCost;

  const handlePayment = async () => {
    // Validate card details
    if (paymentMethod === "card") {
      if (!cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiryDate || !cardDetails.cvv) {
        toast({
          title: "Incomplete Details",
          description: "Please fill in all card details",
          variant: "destructive",
        });
        return;
      }
    }

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const bookingId = `SB${Date.now().toString().slice(-8)}`;
      const pnr = `${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      toast({
        title: "Payment Successful",
        description: `Your booking ${bookingId} is confirmed!`,
      });

      onPaymentComplete(
        {
          method: paymentMethod,
          amount: totalAmount,
          transactionId: `TXN${Date.now()}`,
        },
        bookingId
      );

      setProcessing(false);
    }, 2000);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Payment Form */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Payment Method Selection */}
            <div className="mb-6">
              <Label className="mb-3 block">Select Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Credit / Debit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex items-center cursor-pointer flex-1">
                    <Wallet className="h-5 w-5 mr-2" />
                    UPI
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="netbanking" id="netbanking" />
                  <Label htmlFor="netbanking" className="flex items-center cursor-pointer flex-1">
                    <Building2 className="h-5 w-5 mr-2" />
                    Net Banking
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Card Details Form */}
            {paymentMethod === "card" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                    maxLength={19}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cardholder Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={cardDetails.cardHolder}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardHolder: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                      maxLength={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input
                      type="password"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "upi" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>UPI ID</Label>
                  <Input placeholder="yourname@upi" />
                </div>
              </div>
            )}

            {paymentMethod === "netbanking" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Bank</Label>
                  <Input placeholder="Search for your bank" />
                </div>
              </div>
            )}

            {/* Security Info */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg flex items-start">
              <Lock className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800 dark:text-green-300">
                Your payment information is encrypted and secure. We do not store your card details.
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={onBack} disabled={processing}>
                Back
              </Button>
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="bg-gradient-sky text-white hover:opacity-90"
              >
                {processing ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Summary */}
      <div>
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-lg">Price Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Base Fare ({bookingData.passengers.length} × ${baseFare})</span>
              <span>${totalBaseFare.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Taxes & Fees</span>
              <span>${taxes.toFixed(2)}</span>
            </div>

            {addonsCost > 0 && (
              <div className="flex justify-between text-sm">
                <span>Add-ons</span>
                <span>${addonsCost.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-3 border-t flex justify-between font-bold text-lg">
              <span>Total Amount</span>
              <span className="text-primary">${totalAmount.toFixed(2)}</span>
            </div>

            {/* Passengers */}
            <div className="pt-3 border-t">
              <h4 className="text-sm font-semibold mb-2">Passengers</h4>
              <div className="space-y-1">
                {bookingData.passengers.map((passenger: any, index: number) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    {passenger.fullName}
                    {bookingData.selectedSeats[passenger.fullName] && (
                      <span className="ml-2 font-medium">
                        (Seat: {bookingData.selectedSeats[passenger.fullName]})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Flight Details */}
            <div className="pt-3 border-t">
              <h4 className="text-sm font-semibold mb-2">Flight Details</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>{flightData.flightNumber}</div>
                <div>{flightData.from} → {flightData.to}</div>
                <div>{flightData.date}</div>
                <div>{flightData.departureTime} - {flightData.arrivalTime}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentStep;
