import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plane, 
  PlaneTakeoff, 
  PlaneLanding, 
  Clock, 
  Radio, 
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Timer
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
  gate: string;
  flightDate: string;
  sourceAirport: {
    code: string;
    city: string;
    name: string;
    terminal_info: string | null;
  };
  destinationAirport: {
    code: string;
    city: string;
    name: string;
    terminal_info: string | null;
  };
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  scheduled: { 
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30", 
    icon: <Clock className="h-4 w-4" />,
    label: "Scheduled"
  },
  boarding: { 
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse", 
    icon: <Timer className="h-4 w-4" />,
    label: "Boarding"
  },
  departed: { 
    color: "bg-green-500/20 text-green-400 border-green-500/30", 
    icon: <PlaneTakeoff className="h-4 w-4" />,
    label: "Departed"
  },
  arrived: { 
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", 
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "Arrived"
  },
  delayed: { 
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse", 
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Delayed"
  },
  cancelled: { 
    color: "bg-red-500/20 text-red-400 border-red-500/30", 
    icon: <XCircle className="h-4 w-4" />,
    label: "Cancelled"
  },
};

const FlightStatus = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState("departures");

  const fetchFlights = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('flight_instances')
        .select(`
          id,
          flight_date,
          departure_time,
          arrival_time,
          status,
          gate,
          flight_templates!inner (
            flight_number,
            airline_name,
            routes!inner (
              source_airport:airports!routes_source_airport_id_fkey (
                code,
                city,
                name,
                terminal_info
              ),
              destination_airport:airports!routes_destination_airport_id_fkey (
                code,
                city,
                name,
                terminal_info
              )
            )
          )
        `)
        .gte('flight_date', today)
        .order('departure_time', { ascending: true });

      if (error) throw error;

      const transformedFlights = (data || []).map((flight: any) => ({
        id: flight.id,
        flightNumber: flight.flight_templates.flight_number,
        airline: flight.flight_templates.airline_name,
        departureTime: flight.departure_time.substring(0, 5),
        arrivalTime: flight.arrival_time.substring(0, 5),
        status: flight.status,
        gate: flight.gate || 'TBA',
        flightDate: flight.flight_date,
        sourceAirport: flight.flight_templates.routes.source_airport,
        destinationAirport: flight.flight_templates.routes.destination_airport,
      }));

      setFlights(transformedFlights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching flights:', error);
      toast.error('Failed to load flight status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('flight-status-board')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flight_instances'
        },
        (payload) => {
          console.log('Real-time status update:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            
            setFlights(prev => prev.map(flight => {
              if (flight.id === updated.id) {
                const statusInfo = statusConfig[updated.status];
                toast.info(`Flight ${flight.flightNumber} - ${statusInfo?.label || updated.status}`, {
                  description: updated.gate ? `Gate: ${updated.gate}` : undefined,
                  icon: statusInfo?.icon
                });
                
                return {
                  ...flight,
                  status: updated.status,
                  gate: updated.gate || 'TBA',
                };
              }
              return flight;
            }));
            setLastUpdated(new Date());
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredFlights = flights.filter(flight => {
    const query = searchQuery.toLowerCase();
    return (
      flight.flightNumber.toLowerCase().includes(query) ||
      flight.sourceAirport.city.toLowerCase().includes(query) ||
      flight.destinationAirport.city.toLowerCase().includes(query) ||
      flight.sourceAirport.code.toLowerCase().includes(query) ||
      flight.destinationAirport.code.toLowerCase().includes(query)
    );
  });

  const FlightRow = ({ flight, type }: { flight: Flight; type: 'departure' | 'arrival' }) => {
    const status = statusConfig[flight.status] || statusConfig.scheduled;
    const airport = type === 'departure' ? flight.destinationAirport : flight.sourceAirport;
    const time = type === 'departure' ? flight.departureTime : flight.arrivalTime;

    return (
      <div className="grid grid-cols-6 gap-4 p-4 border-b border-border/50 hover:bg-muted/30 transition-colors items-center">
        <div className="font-mono font-bold text-lg text-primary">
          {flight.flightNumber}
        </div>
        <div>
          <p className="font-semibold">{airport.city}</p>
          <p className="text-sm text-muted-foreground">{airport.code}</p>
        </div>
        <div className="font-mono text-2xl font-bold">
          {time}
        </div>
        <div className="font-mono text-xl font-semibold text-primary">
          {flight.gate}
        </div>
        <div>
          <Badge className={`${status.color} border gap-1`}>
            {status.icon}
            {status.label}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {format(new Date(flight.flightDate), 'MMM dd')}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Plane className="h-8 w-8 text-primary" />
              Live Flight Status Board
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Radio className="h-4 w-4 text-green-500 animate-pulse" />
              Real-time updates • Last updated: {format(lastUpdated, 'HH:mm:ss')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search flight or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={fetchFlights}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Status Legend */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-center">
            {Object.entries(statusConfig).map(([key, config]) => (
              <Badge key={key} className={`${config.color} border gap-1`}>
                {config.icon}
                {config.label}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Flight Board */}
        <Card className="overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="bg-gradient-sky p-4">
              <TabsList className="bg-white/10">
                <TabsTrigger value="departures" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                  <PlaneTakeoff className="h-4 w-4 mr-2" />
                  Departures
                </TabsTrigger>
                <TabsTrigger value="arrivals" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                  <PlaneLanding className="h-4 w-4 mr-2" />
                  Arrivals
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50 text-sm font-semibold text-muted-foreground border-b">
              <div>Flight</div>
              <div>{activeTab === 'departures' ? 'Destination' : 'Origin'}</div>
              <div>Time</div>
              <div>Gate</div>
              <div>Status</div>
              <div>Date</div>
            </div>

            <TabsContent value="departures" className="m-0">
              {loading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-muted-foreground">Loading flights...</p>
                </div>
              ) : filteredFlights.length === 0 ? (
                <div className="p-12 text-center">
                  <Plane className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No flights found</p>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredFlights.map(flight => (
                    <FlightRow key={flight.id} flight={flight} type="departure" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="arrivals" className="m-0">
              {loading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-muted-foreground">Loading flights...</p>
                </div>
              ) : filteredFlights.length === 0 ? (
                <div className="p-12 text-center">
                  <Plane className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No flights found</p>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredFlights.map(flight => (
                    <FlightRow key={flight.id} flight={flight} type="arrival" />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center">
          <Button onClick={() => navigate('/')} variant="outline">
            Search & Book Flights
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlightStatus;
