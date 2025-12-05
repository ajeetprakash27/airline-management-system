import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PassengerDetailsStepProps {
  passengers: any[];
  onUpdate: (passengers: any[]) => void;
  onNext: () => void;
}

const PassengerDetailsStep = ({ passengers, onUpdate, onNext }: PassengerDetailsStepProps) => {
  const [localPassengers, setLocalPassengers] = useState(
    passengers.length > 0
      ? passengers
      : [{ fullName: "", age: "", gender: "", idType: "passport", idNumber: "" }]
  );

  const addPassenger = () => {
    setLocalPassengers([
      ...localPassengers,
      { fullName: "", age: "", gender: "", idType: "passport", idNumber: "" },
    ]);
  };

  const removePassenger = (index: number) => {
    if (localPassengers.length > 1) {
      setLocalPassengers(localPassengers.filter((_, i) => i !== index));
    }
  };

  const updatePassenger = (index: number, field: string, value: string) => {
    const updated = [...localPassengers];
    updated[index] = { ...updated[index], [field]: value };
    setLocalPassengers(updated);
  };

  const handleNext = () => {
    // Validate all passengers
    const isValid = localPassengers.every(
      (p) => p.fullName && p.age && p.gender && p.idType && p.idNumber
    );

    if (!isValid) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all passenger details",
        variant: "destructive",
      });
      return;
    }

    onUpdate(localPassengers);
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="h-5 w-5 mr-2" />
          Passenger Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {localPassengers.map((passenger, index) => (
          <Card key={index} className="p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Passenger {index + 1}</h3>
              {localPassengers.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePassenger(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="John Doe"
                  value={passenger.fullName}
                  onChange={(e) => updatePassenger(index, "fullName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  placeholder="25"
                  value={passenger.age}
                  onChange={(e) => updatePassenger(index, "age", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={passenger.gender}
                  onValueChange={(value) => updatePassenger(index, "gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ID Type</Label>
                <Select
                  value={passenger.idType}
                  onValueChange={(value) => updatePassenger(index, "idType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="national_id">National ID</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>ID Number</Label>
                <Input
                  placeholder="Enter ID number"
                  value={passenger.idNumber}
                  onChange={(e) => updatePassenger(index, "idNumber", e.target.value)}
                />
              </div>
            </div>
          </Card>
        ))}

        <Button variant="outline" onClick={addPassenger} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Passenger
        </Button>

        <div className="flex justify-end pt-4">
          <Button onClick={handleNext} className="bg-gradient-sky text-white hover:opacity-90">
            Continue to Seat Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PassengerDetailsStep;
