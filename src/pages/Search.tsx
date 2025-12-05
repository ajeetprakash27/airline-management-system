import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FlightFilters from "@/components/search/FlightFilters";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plane, Clock, Calendar, MapPin, Gauge, Users, CircleDot, Radio } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState<any[]>([]);

  // Filter states
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [departureTimeRanges, setDepartureTimeRanges] = useState<string[]>([]);
  const [arrivalTimeRanges, setArrivalTimeRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("price-asc");

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const departDate = searchParams.get("departDate") || "";
  const tripType = searchParams.get("tripType") || "one-way";
  const segmentsParam = searchParams.get("segments");
  
  // Parse multi-city segments if present
  const multiCitySegments = segmentsParam ? JSON.parse(segmentsParam) : null;

  useEffect(() => {
    const fetchFlights = async () => {
      if (tripType === "multi-city" && !multiCitySegments) {
        setLoading(false);
        return;
      }

      if (tripType !== "multi-city" && !from && !to && !departDate) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // For multi-city, fetch flights for each segment
        if (tripType === "multi-city" && multiCitySegments) {
          const allSegmentFlights = await Promise.all(
            multiCitySegments.map(async (segment: any, index: number) => {
              let query = supabase
                .from('flight_instances')
                .select(`
                  id,
                  flight_date,
                  departure_time,
                  arrival_time,
                  economy_price,
                  business_price,
                  first_class_price,
                  available_economy_seats,
                  available_business_seats,
                  available_first_class_seats,
                  status,
                  gate,
                  aircraft_id,
                  aircrafts (
                    model,
                    manufacturer,
                    total_seats,
                    economy_seats,
                    business_seats,
                    first_class_seats
                  ),
                  flight_templates!inner (
                    flight_number,
                    airline_name,
                    routes!inner (
                      duration_minutes,
                      distance_km,
                      source_airport:airports!routes_source_airport_id_fkey (
                        code,
                        city,
                        name,
                        terminal_info,
                        country
                      ),
                      destination_airport:airports!routes_destination_airport_id_fkey (
                        code,
                        city,
                        name,
                        terminal_info,
                        country
                      )
                    )
                  )
                `)
                .eq('status', 'scheduled')
                .eq('flight_date', segment.date);

              const { data, error } = await query;
              if (error) throw error;

              // Filter by from/to
              let filteredFlights = data || [];
              
              if (segment.from) {
                filteredFlights = filteredFlights.filter((flight: any) => {
                  const sourceAirport = flight.flight_templates.routes.source_airport;
                  return sourceAirport.city.toLowerCase().includes(segment.from.toLowerCase()) ||
                         sourceAirport.code.toLowerCase().includes(segment.from.toLowerCase());
                });
              }

              if (segment.to) {
                filteredFlights = filteredFlights.filter((flight: any) => {
                  const destAirport = flight.flight_templates.routes.destination_airport;
                  return destAirport.city.toLowerCase().includes(segment.to.toLowerCase()) ||
                         destAirport.code.toLowerCase().includes(segment.to.toLowerCase());
                });
              }

              return {
                segmentIndex: index,
                segment,
                flights: filteredFlights.map((flight: any) => ({
                  id: flight.id,
                  flightNumber: flight.flight_templates.flight_number,
                  airline: flight.flight_templates.airline_name,
                  departureTime: flight.departure_time.substring(0, 5),
                  arrivalTime: flight.arrival_time.substring(0, 5),
                  duration: `${Math.floor(flight.flight_templates.routes.duration_minutes / 60)}h ${flight.flight_templates.routes.duration_minutes % 60}m`,
                  durationMinutes: flight.flight_templates.routes.duration_minutes,
                  distance: flight.flight_templates.routes.distance_km,
                  economyPrice: Number(flight.economy_price),
                  businessPrice: Number(flight.business_price),
                  firstClassPrice: flight.first_class_price ? Number(flight.first_class_price) : null,
                  availableSeats: flight.available_economy_seats + flight.available_business_seats + (flight.available_first_class_seats || 0),
                  availableEconomySeats: flight.available_economy_seats,
                  availableBusinessSeats: flight.available_business_seats,
                  availableFirstClassSeats: flight.available_first_class_seats || 0,
                  status: flight.status,
                  gate: flight.gate || 'TBA',
                  aircraft: flight.aircrafts,
                  flightDate: flight.flight_date,
                  sourceAirport: flight.flight_templates.routes.source_airport,
                  destinationAirport: flight.flight_templates.routes.destination_airport,
                })),
              };
            })
          );

          // Store multi-city results differently
          setFlights(allSegmentFlights as any);
        } else {
          // Regular one-way/round-trip search
          // Regular one-way/round-trip search
          let query = supabase
            .from('flight_instances')
            .select(`
              id,
              flight_date,
              departure_time,
              arrival_time,
              economy_price,
              business_price,
              first_class_price,
              available_economy_seats,
              available_business_seats,
              available_first_class_seats,
              status,
              gate,
              aircraft_id,
              aircrafts (
                model,
                manufacturer,
                total_seats,
                economy_seats,
                business_seats,
                first_class_seats
              ),
              flight_templates!inner (
                flight_number,
                airline_name,
                routes!inner (
                  duration_minutes,
                  distance_km,
                  source_airport:airports!routes_source_airport_id_fkey (
                    code,
                    city,
                    name,
                    terminal_info,
                    country
                  ),
                  destination_airport:airports!routes_destination_airport_id_fkey (
                    code,
                    city,
                    name,
                    terminal_info,
                    country
                  )
                )
              )
            `)
            .eq('status', 'scheduled');

          if (departDate) {
            query = query.eq('flight_date', departDate);
          }

          const { data, error } = await query;

          if (error) throw error;

          // Filter by from/to if provided
          let filteredFlights = data || [];
          
          if (from) {
            filteredFlights = filteredFlights.filter((flight: any) => {
              const sourceAirport = flight.flight_templates.routes.source_airport;
              return sourceAirport.city.toLowerCase().includes(from.toLowerCase()) ||
                     sourceAirport.code.toLowerCase().includes(from.toLowerCase());
            });
          }

          if (to) {
            filteredFlights = filteredFlights.filter((flight: any) => {
              const destAirport = flight.flight_templates.routes.destination_airport;
              return destAirport.city.toLowerCase().includes(to.toLowerCase()) ||
                     destAirport.code.toLowerCase().includes(to.toLowerCase());
            });
          }

          // Transform data to match component structure
          const transformedFlights = filteredFlights.map((flight: any) => ({
            id: flight.id,
            flightNumber: flight.flight_templates.flight_number,
            airline: flight.flight_templates.airline_name,
            departureTime: flight.departure_time.substring(0, 5),
            arrivalTime: flight.arrival_time.substring(0, 5),
            duration: `${Math.floor(flight.flight_templates.routes.duration_minutes / 60)}h ${flight.flight_templates.routes.duration_minutes % 60}m`,
            durationMinutes: flight.flight_templates.routes.duration_minutes,
            distance: flight.flight_templates.routes.distance_km,
            economyPrice: Number(flight.economy_price),
            businessPrice: Number(flight.business_price),
            firstClassPrice: flight.first_class_price ? Number(flight.first_class_price) : null,
            availableSeats: flight.available_economy_seats + flight.available_business_seats + (flight.available_first_class_seats || 0),
            availableEconomySeats: flight.available_economy_seats,
            availableBusinessSeats: flight.available_business_seats,
            availableFirstClassSeats: flight.available_first_class_seats || 0,
            status: flight.status,
            gate: flight.gate || 'TBA',
            aircraft: flight.aircrafts,
            flightDate: flight.flight_date,
            sourceAirport: flight.flight_templates.routes.source_airport,
            destinationAirport: flight.flight_templates.routes.destination_airport,
          }));

          setFlights(transformedFlights);
        }
      } catch (error: any) {
        console.error('Error fetching flights:', error);
        toast.error('Failed to fetch flights. Please try again.');
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [from, to, departDate, tripType, multiCitySegments]);

  // Real-time flight updates subscription
  useEffect(() => {
    const channel = supabase
      .channel('flight-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flight_instances'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const updatedFlight = payload.new as any;
            
            setFlights(prevFlights => {
              // Handle multi-city format
              if (tripType === "multi-city" && Array.isArray(prevFlights) && prevFlights[0]?.flights) {
                return prevFlights.map((segment: any) => ({
                  ...segment,
                  flights: segment.flights.map((f: any) => {
                    if (f.id === updatedFlight.id) {
                      toast.info(`Flight ${f.flightNumber} updated`, {
                        description: `Status: ${updatedFlight.status.toUpperCase()}${updatedFlight.gate ? ` | Gate: ${updatedFlight.gate}` : ''}`
                      });
                      return {
                        ...f,
                        status: updatedFlight.status,
                        gate: updatedFlight.gate || 'TBA',
                        availableEconomySeats: updatedFlight.available_economy_seats,
                        availableBusinessSeats: updatedFlight.available_business_seats,
                        availableFirstClassSeats: updatedFlight.available_first_class_seats || 0,
                        availableSeats: updatedFlight.available_economy_seats + updatedFlight.available_business_seats + (updatedFlight.available_first_class_seats || 0),
                        economyPrice: Number(updatedFlight.economy_price),
                        businessPrice: Number(updatedFlight.business_price),
                        firstClassPrice: updatedFlight.first_class_price ? Number(updatedFlight.first_class_price) : null,
                      };
                    }
                    return f;
                  })
                }));
              }

              // Handle regular flights format
              return prevFlights.map((flight: any) => {
                if (flight.id === updatedFlight.id) {
                  toast.info(`Flight ${flight.flightNumber} updated`, {
                    description: `Status: ${updatedFlight.status.toUpperCase()}${updatedFlight.gate ? ` | Gate: ${updatedFlight.gate}` : ''}`
                  });
                  return {
                    ...flight,
                    status: updatedFlight.status,
                    gate: updatedFlight.gate || 'TBA',
                    availableEconomySeats: updatedFlight.available_economy_seats,
                    availableBusinessSeats: updatedFlight.available_business_seats,
                    availableFirstClassSeats: updatedFlight.available_first_class_seats || 0,
                    availableSeats: updatedFlight.available_economy_seats + updatedFlight.available_business_seats + (updatedFlight.available_first_class_seats || 0),
                    economyPrice: Number(updatedFlight.economy_price),
                    businessPrice: Number(updatedFlight.business_price),
                    firstClassPrice: updatedFlight.first_class_price ? Number(updatedFlight.first_class_price) : null,
                  };
                }
                return flight;
              });
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripType]);

  // Get unique airlines from flights (handle both regular and multi-city)
  const availableAirlines = useMemo(() => {
    if (tripType === "multi-city" && Array.isArray(flights) && flights[0]?.flights) {
      const allFlights = flights.flatMap((segment: any) => segment.flights);
      const airlines = new Set(allFlights.map((f: any) => f.airline));
      return Array.from(airlines).sort();
    }
    const airlines = new Set(flights.map((f: any) => f.airline));
    return Array.from(airlines).sort();
  }, [flights, tripType]);

  // Get max price for slider (handle both regular and multi-city)
  const maxPrice = useMemo(() => {
    if (tripType === "multi-city" && Array.isArray(flights) && flights[0]?.flights) {
      const allFlights = flights.flatMap((segment: any) => segment.flights);
      if (allFlights.length === 0) return 50000;
      return Math.ceil(Math.max(...allFlights.map((f: any) => f.economyPrice)) / 100) * 100;
    }
    if (flights.length === 0) return 50000;
    return Math.ceil(Math.max(...flights.map((f: any) => f.economyPrice)) / 100) * 100;
  }, [flights, tripType]);

  // Update price range when max price changes
  useEffect(() => {
    if (maxPrice > 0) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);

  // Helper function to get time slot
  const getTimeSlot = (time: string) => {
    const hour = parseInt(time.split(":")[0]);
    if (hour >= 0 && hour < 6) return "early";
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    return "evening";
  };

  // Filter and sort flights
  const filteredAndSortedFlights = useMemo(() => {
    let filtered = flights.filter((flight) => {
      // Airline filter
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(flight.airline)) {
        return false;
      }

      // Price filter
      if (flight.economyPrice < priceRange[0] || flight.economyPrice > priceRange[1]) {
        return false;
      }

      // Stops filter (for now, assuming all flights are non-stop)
      if (selectedStops.length > 0 && !selectedStops.includes("0")) {
        return false;
      }

      // Departure time filter
      if (departureTimeRanges.length > 0) {
        const slot = getTimeSlot(flight.departureTime);
        if (!departureTimeRanges.includes(slot)) {
          return false;
        }
      }

      // Arrival time filter
      if (arrivalTimeRanges.length > 0) {
        const slot = getTimeSlot(flight.arrivalTime);
        if (!arrivalTimeRanges.includes(slot)) {
          return false;
        }
      }

      return true;
    });

    // Sort flights
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.economyPrice - b.economyPrice;
        case "price-desc":
          return b.economyPrice - a.economyPrice;
        case "departure-asc":
          return a.departureTime.localeCompare(b.departureTime);
        case "departure-desc":
          return b.departureTime.localeCompare(a.departureTime);
        case "duration-asc":
          return a.durationMinutes - b.durationMinutes;
        case "duration-desc":
          return b.durationMinutes - a.durationMinutes;
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    flights,
    selectedAirlines,
    priceRange,
    selectedStops,
    departureTimeRanges,
    arrivalTimeRanges,
    sortBy,
  ]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedAirlines.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    if (selectedStops.length > 0) count++;
    if (departureTimeRanges.length > 0) count++;
    if (arrivalTimeRanges.length > 0) count++;
    return count;
  }, [selectedAirlines, priceRange, maxPrice, selectedStops, departureTimeRanges, arrivalTimeRanges]);

  const handleResetFilters = () => {
    setSelectedAirlines([]);
    setPriceRange([0, maxPrice]);
    setSelectedStops([]);
    setDepartureTimeRanges([]);
    setArrivalTimeRanges([]);
    setSortBy("price-asc");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Summary */}
        <Card className="p-6 mb-8 bg-gradient-sky text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Flight Search Results</h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <Plane className="h-4 w-4 mr-1" />
                  {flights.length > 0 && flights[0]?.sourceAirport 
                    ? `${flights[0].sourceAirport.city} (${flights[0].sourceAirport.code})` 
                    : tripType === "multi-city" && flights[0]?.segment
                    ? `${flights[0].segment.from}`
                    : from || "Any"} → {flights.length > 0 && flights[0]?.destinationAirport 
                    ? `${flights[0].destinationAirport.city} (${flights[0].destinationAirport.code})` 
                    : tripType === "multi-city" && flights[flights.length - 1]?.segment
                    ? `${flights[flights.length - 1].segment.to}`
                    : to || "Any"}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {departDate ? format(new Date(departDate), "PPP") : "Any date"}
                </span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {tripType === "round-trip" ? "Round-trip" : tripType === "multi-city" ? "Multi-city" : "One-way"}
                </Badge>
                <Badge variant="secondary" className="bg-green-500/30 text-white border-green-400/50 animate-pulse">
                  <Radio className="h-3 w-3 mr-1" />
                  Live Updates
                </Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white text-white hover:bg-white/20"
              onClick={() => navigate('/')}
            >
              Modify Search
            </Button>
          </div>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <Plane className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Searching for flights...</p>
          </div>
        ) : flights.length === 0 ? (
          <div className="text-center py-12">
            <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No flights found for your search criteria.</p>
            <p className="text-sm text-muted-foreground mt-2">Try different dates or destinations.</p>
          </div>
        ) : tripType === "multi-city" && flights[0]?.flights ? (
          // Multi-city results display
          <div className="space-y-6">
            {flights.map((segmentData: any, segmentIndex: number) => (
              <div key={segmentIndex} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {segmentIndex + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {segmentData.segment.from} → {segmentData.segment.to}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(segmentData.segment.date), "EEE, MMM dd, yyyy")} • {segmentData.flights.length} flights available
                    </p>
                  </div>
                </div>

                {segmentData.flights.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Plane className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No flights found for this segment</p>
                    <p className="text-sm text-muted-foreground mt-1">Try different dates or destinations</p>
                  </Card>
                ) : (
                  segmentData.flights.slice(0, 3).map((flight: any) => (
                    <Card key={flight.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Status Bar */}
                      <div className={`px-6 py-2 flex items-center justify-between text-sm ${
                        flight.status === 'scheduled' ? 'bg-green-50 dark:bg-green-950/20' :
                        flight.status === 'boarding' ? 'bg-blue-50 dark:bg-blue-950/20' :
                        flight.status === 'delayed' ? 'bg-yellow-50 dark:bg-yellow-950/20' :
                        'bg-muted'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <CircleDot className={`h-4 w-4 ${
                            flight.status === 'scheduled' ? 'text-green-600 dark:text-green-400' :
                            flight.status === 'boarding' ? 'text-blue-600 dark:text-blue-400' :
                            flight.status === 'delayed' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-muted-foreground'
                          }`} />
                          <span className="font-medium capitalize">{flight.status}</span>
                          <Badge variant="outline" className="ml-2">
                            {format(new Date(flight.flightDate), "EEE, MMM dd")}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-muted-foreground">Gate: <span className="font-semibold text-foreground">{flight.gate}</span></span>
                          {flight.aircraft && (
                            <span className="text-muted-foreground hidden md:inline">Aircraft: <span className="font-semibold text-foreground">{flight.aircraft.manufacturer} {flight.aircraft.model}</span></span>
                          )}
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Flight Route Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-sky rounded-lg flex items-center justify-center text-white shadow-glow">
                              <Plane className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-xl font-bold">{flight.flightNumber}</h3>
                                <Badge variant="secondary">{flight.airline}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {flight.sourceAirport?.city} → {flight.destinationAirport?.city}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Main Flight Info */}
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          {/* Departure */}
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>Departure</span>
                            </div>
                            <p className="text-3xl font-bold">{flight.departureTime}</p>
                            <p className="text-sm font-semibold">{flight.sourceAirport?.code}</p>
                            <p className="text-xs text-muted-foreground">{flight.sourceAirport?.name}</p>
                          </div>

                          {/* Duration */}
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <p className="text-lg font-bold">{flight.duration}</p>
                            <div className="w-full relative">
                              <div className="h-px bg-border" />
                              <Plane className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-primary rotate-90" />
                            </div>
                          </div>

                          {/* Arrival */}
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>Arrival</span>
                            </div>
                            <p className="text-3xl font-bold">{flight.arrivalTime}</p>
                            <p className="text-sm font-semibold">{flight.destinationAirport?.code}</p>
                            <p className="text-xs text-muted-foreground">{flight.destinationAirport?.name}</p>
                          </div>
                        </div>

                        {/* Pricing & CTA */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex space-x-6">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Economy</p>
                              <p className="text-xl font-bold text-primary">${flight.economyPrice}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Business</p>
                              <p className="text-xl font-bold text-primary">${flight.businessPrice}</p>
                            </div>
                          </div>

                          <Button
                            className="bg-gradient-sky text-white hover:opacity-90"
                            onClick={() => {
                              const params = new URLSearchParams({
                                flightId: flight.id,
                                fareClass: "economy",
                                from: flight.sourceAirport?.city || segmentData.segment.from,
                                to: flight.destinationAirport?.city || segmentData.segment.to,
                                date: flight.flightDate,
                              });
                              window.location.href = `/booking?${params.toString()}`;
                            }}
                          >
                            <Plane className="mr-2 h-4 w-4" />
                            Select Flight
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}

                {segmentData.flights.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    + {segmentData.flights.length - 3} more flights available
                  </p>
                )}
              </div>
            ))}

            <Card className="p-6 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Multi-city bookings may require separate reservations for each segment. 
                Total price will be calculated during the booking process.
              </p>
            </Card>
          </div>
        ) : (
          // Regular one-way/round-trip results
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <FlightFilters
                airlines={availableAirlines}
                selectedAirlines={selectedAirlines}
                onAirlineChange={setSelectedAirlines}
                priceRange={priceRange}
                maxPrice={maxPrice}
                onPriceChange={setPriceRange}
                selectedStops={selectedStops}
                onStopsChange={setSelectedStops}
                timeRanges={{
                  departure: departureTimeRanges,
                  arrival: arrivalTimeRanges,
                }}
                onTimeRangeChange={(type, ranges) => {
                  if (type === 'departure') {
                    setDepartureTimeRanges(ranges);
                  } else {
                    setArrivalTimeRanges(ranges);
                  }
                }}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onReset={handleResetFilters}
                activeFiltersCount={activeFiltersCount}
              />
            </div>

            {/* Flight Results */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {filteredAndSortedFlights.length} of {flights.length} flights
                </p>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">
                    {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                  </Badge>
                )}
              </div>
              {filteredAndSortedFlights.length === 0 ? (
                <div className="text-center py-12">
                  <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No flights match your filters.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleResetFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                filteredAndSortedFlights.map((flight) => (
              <Card key={flight.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Status Bar */}
                <div className={`px-6 py-2 flex items-center justify-between text-sm ${
                  flight.status === 'scheduled' ? 'bg-green-50 dark:bg-green-950/20' :
                  flight.status === 'boarding' ? 'bg-blue-50 dark:bg-blue-950/20' :
                  flight.status === 'delayed' ? 'bg-yellow-50 dark:bg-yellow-950/20' :
                  'bg-muted'
                }`}>
                  <div className="flex items-center space-x-2">
                    <CircleDot className={`h-4 w-4 ${
                      flight.status === 'scheduled' ? 'text-green-600 dark:text-green-400' :
                      flight.status === 'boarding' ? 'text-blue-600 dark:text-blue-400' :
                      flight.status === 'delayed' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-muted-foreground'
                    }`} />
                    <span className="font-medium capitalize">{flight.status}</span>
                    <Badge variant="outline" className="ml-2">
                      {format(new Date(flight.flightDate), "EEE, MMM dd")}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-muted-foreground">Gate: <span className="font-semibold text-foreground">{flight.gate}</span></span>
                    {flight.aircraft && (
                      <span className="text-muted-foreground">Aircraft: <span className="font-semibold text-foreground">{flight.aircraft.manufacturer} {flight.aircraft.model}</span></span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {/* Flight Route Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-sky rounded-lg flex items-center justify-center text-white shadow-glow">
                        <Plane className="h-8 w-8" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-2xl font-bold">{flight.flightNumber}</h3>
                          <Badge variant="secondary">{flight.airline}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {flight.sourceAirport?.city} → {flight.destinationAirport?.city}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Main Flight Info */}
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Departure */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Departure</span>
                      </div>
                      <div>
                        <p className="text-4xl font-bold">{flight.departureTime}</p>
                        <p className="text-lg font-semibold mt-1">{flight.sourceAirport?.code}</p>
                        <p className="text-sm text-muted-foreground">{flight.sourceAirport?.name}</p>
                        <p className="text-sm text-muted-foreground">{flight.sourceAirport?.city}, {flight.sourceAirport?.country}</p>
                        {flight.sourceAirport?.terminal_info && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Terminal: {flight.sourceAirport.terminal_info}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Flight Duration */}
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Clock className="h-6 w-6 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Duration</p>
                      <p className="text-xl font-bold">{flight.duration}</p>
                      <div className="w-full relative pt-2">
                        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                        <Plane className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary rotate-90" />
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Gauge className="h-3 w-3" />
                        <span>{flight.distance} km</span>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Arrival</span>
                      </div>
                      <div>
                        <p className="text-4xl font-bold">{flight.arrivalTime}</p>
                        <p className="text-lg font-semibold mt-1">{flight.destinationAirport?.code}</p>
                        <p className="text-sm text-muted-foreground">{flight.destinationAirport?.name}</p>
                        <p className="text-sm text-muted-foreground">{flight.destinationAirport?.city}, {flight.destinationAirport?.country}</p>
                        {flight.destinationAirport?.terminal_info && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Terminal: {flight.destinationAirport.terminal_info}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Aircraft & Seat Details */}
                  {flight.aircraft && (
                    <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Aircraft Information</p>
                          <div className="space-y-1">
                            <p className="font-semibold">{flight.aircraft.manufacturer} {flight.aircraft.model}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                                Total Capacity: {flight.aircraft.total_seats}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Seat Availability</p>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center p-2 bg-background rounded">
                              <p className="font-bold text-lg">{flight.availableEconomySeats}</p>
                              <p className="text-xs text-muted-foreground">Economy</p>
                            </div>
                            <div className="text-center p-2 bg-background rounded">
                              <p className="font-bold text-lg">{flight.availableBusinessSeats}</p>
                              <p className="text-xs text-muted-foreground">Business</p>
                            </div>
                            {flight.availableFirstClassSeats > 0 && (
                              <div className="text-center p-2 bg-background rounded">
                                <p className="font-bold text-lg">{flight.availableFirstClassSeats}</p>
                                <p className="text-xs text-muted-foreground">First Class</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-6">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Economy</p>
                        <p className="text-2xl font-bold text-primary">${flight.economyPrice}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Business</p>
                        <p className="text-2xl font-bold text-primary">${flight.businessPrice}</p>
                      </div>
                      {flight.firstClassPrice && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">First Class</p>
                          <p className="text-2xl font-bold text-primary">${flight.firstClassPrice}</p>
                        </div>
                      )}
                    </div>

                    <Button
                      size="lg"
                      className="bg-gradient-sky text-white hover:opacity-90"
                      onClick={() => {
                        const params = new URLSearchParams({
                          flightId: flight.id,
                          fareClass: "economy",
                          from: flight.sourceAirport?.city || from,
                          to: flight.destinationAirport?.city || to,
                          date: departDate,
                        });
                        window.location.href = `/booking?${params.toString()}`;
                      }}
                    >
                      <Plane className="mr-2 h-5 w-5" />
                      Select Flight
                    </Button>
                  </div>
                </div>
              </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;