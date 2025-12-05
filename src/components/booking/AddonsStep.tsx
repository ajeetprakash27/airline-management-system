import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingBag, Luggage, UtensilsCrossed, Zap, Plus, Minus } from "lucide-react";

interface AddonsStepProps {
  passengers: any[];
  addons: any[];
  onUpdate: (addons: any[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const AddonsStep = ({ passengers, addons, onUpdate, onNext, onBack }: AddonsStepProps) => {
  const [localAddons, setLocalAddons] = useState(addons);

  const availableAddons = [
    {
      id: "extra_baggage",
      name: "Extra Baggage",
      description: "Additional 15kg baggage allowance",
      price: 25,
      icon: Luggage,
      category: "baggage",
    },
    {
      id: "meal_veg",
      name: "Vegetarian Meal",
      description: "Fresh vegetarian meal prepared onboard",
      price: 15,
      icon: UtensilsCrossed,
      category: "meal",
    },
    {
      id: "meal_nonveg",
      name: "Non-Vegetarian Meal",
      description: "Delicious non-vegetarian meal",
      price: 18,
      icon: UtensilsCrossed,
      category: "meal",
    },
    {
      id: "priority_boarding",
      name: "Priority Boarding",
      description: "Board the aircraft first and get settled in",
      price: 12,
      icon: Zap,
      category: "service",
    },
    {
      id: "lounge_access",
      name: "Airport Lounge Access",
      description: "Relax in premium airport lounge before your flight",
      price: 35,
      icon: ShoppingBag,
      category: "service",
    },
  ];

  const toggleAddon = (addonId: string) => {
    const addon = availableAddons.find((a) => a.id === addonId);
    if (!addon) return;

    const existingIndex = localAddons.findIndex((a) => a.id === addonId);
    
    if (existingIndex >= 0) {
      setLocalAddons(localAddons.filter((a) => a.id !== addonId));
    } else {
      setLocalAddons([...localAddons, { ...addon, quantity: 1 }]);
    }
  };

  const updateQuantity = (addonId: string, delta: number) => {
    const updated = localAddons.map((addon) => {
      if (addon.id === addonId) {
        const newQuantity = Math.max(1, Math.min(passengers.length, addon.quantity + delta));
        return { ...addon, quantity: newQuantity };
      }
      return addon;
    });
    setLocalAddons(updated);
  };

  const isAddonSelected = (addonId: string) => localAddons.some((a) => a.id === addonId);
  const getAddonQuantity = (addonId: string) => localAddons.find((a) => a.id === addonId)?.quantity || 1;

  const totalAddonsCost = localAddons.reduce((sum, addon) => sum + addon.price * addon.quantity, 0);

  const handleNext = () => {
    onUpdate(localAddons);
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Enhance Your Journey
          </span>
          {localAddons.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              Total Add-ons: ${totalAddonsCost}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-6">
          Select additional services to make your flight more comfortable (optional)
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {availableAddons.map((addon) => {
            const Icon = addon.icon;
            const isSelected = isAddonSelected(addon.id);
            const quantity = getAddonQuantity(addon.id);

            return (
              <Card
                key={addon.id}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                }`}
                onClick={() => toggleAddon(addon.id)}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox checked={isSelected} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{addon.name}</h3>
                      </div>
                      <span className="text-lg font-bold text-primary">${addon.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{addon.description}</p>

                    {isSelected && passengers.length > 1 && addon.category !== "service" && (
                      <div
                        className="flex items-center space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-xs text-muted-foreground">Quantity:</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(addon.id, -1)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(addon.id, 1)}
                          disabled={quantity >= passengers.length}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        {localAddons.length > 0 && (
          <Card className="p-4 bg-muted/50">
            <h3 className="font-semibold mb-3">Selected Add-ons</h3>
            <div className="space-y-2">
              {localAddons.map((addon) => (
                <div key={addon.id} className="flex justify-between text-sm">
                  <span>
                    {addon.name} {addon.quantity > 1 && `x ${addon.quantity}`}
                  </span>
                  <span className="font-medium">${addon.price * addon.quantity}</span>
                </div>
              ))}
              <div className="pt-2 border-t flex justify-between font-bold">
                <span>Total Add-ons</span>
                <span className="text-primary">${totalAddonsCost}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleNext} className="bg-gradient-sky text-white hover:opacity-90">
            Continue to Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddonsStep;
