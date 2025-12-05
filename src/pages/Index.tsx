import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plane, Calendar as CalendarIcon, MapPin, Users, Shield, Clock, Award } from "lucide-react";
import { format } from "date-fns";

const Index = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<"one-way" | "round-trip" | "multi-city">("round-trip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();

  const handleSearch = () => {
    if (tripType === "multi-city") {
      navigate("/multi-city");
      return;
    }

    const params = new URLSearchParams({
      from,
      to,
      departDate: departDate ? format(departDate, "yyyy-MM-dd") : "",
      ...(tripType === "round-trip" && returnDate ? { returnDate: format(returnDate, "yyyy-MM-dd") } : {}),
      tripType,
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-sky py-20 px-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-glow">
                <Plane className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Welcome to Scalebrand Airlines
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Experience world-class travel with exceptional service and unbeatable prices
            </p>
          </div>

          {/* Search Card */}
          <Card className="max-w-4xl mx-auto p-6 shadow-lg bg-white/95 backdrop-blur">
            <RadioGroup value={tripType} onValueChange={(value) => setTripType(value as any)} className="flex space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one-way" id="one-way" />
                <Label htmlFor="one-way" className="cursor-pointer">One-way</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="round-trip" id="round-trip" />
                <Label htmlFor="round-trip" className="cursor-pointer">Round-trip</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multi-city" id="multi-city" />
                <Label htmlFor="multi-city" className="cursor-pointer">Multi-city</Label>
              </div>
            </RadioGroup>

            {tripType !== "multi-city" ? (
              <>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="from">From</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="from"
                        placeholder="City or Airport"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to">To</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="to"
                        placeholder="City or Airport"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>Departure Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {departDate ? format(departDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background z-50">
                        <Calendar mode="single" selected={departDate} onSelect={setDepartDate} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {tripType === "round-trip" && (
                    <div className="space-y-2">
                      <Label>Return Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {returnDate ? format(returnDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-background z-50">
                          <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mb-6 p-6 bg-muted/50 rounded-lg text-center">
                <Plane className="h-12 w-12 mx-auto mb-3 text-primary" />
                <p className="font-medium mb-2">Multi-City Itinerary</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Book flights to multiple destinations in one trip
                </p>
              </div>
            )}

            <Button onClick={handleSearch} className="w-full bg-gradient-sky text-white hover:opacity-90 text-lg h-12">
              <Plane className="mr-2 h-5 w-5" />
              {tripType === "multi-city" ? "Continue to Multi-City Search" : "Search Flights"}
            </Button>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Scalebrand Airlines?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Safe & Secure</h3>
              <p className="text-muted-foreground text-sm">Your safety is our top priority with industry-leading standards</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Best Service</h3>
              <p className="text-muted-foreground text-sm">Award-winning service that exceeds expectations</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">On-Time</h3>
              <p className="text-muted-foreground text-sm">Consistent punctuality you can count on</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Customer Care</h3>
              <p className="text-muted-foreground text-sm">24/7 support whenever you need assistance</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 px-4 mt-16">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Scalebrand Airlines</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2025 Scalebrand Airlines. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
