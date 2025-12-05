import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Calendar, MapPin, Download } from "lucide-react";

const MyTrips = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Trips</h1>
          <p className="text-muted-foreground">View and manage your bookings</p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Trips</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <Card className="p-6">
              <div className="text-center py-12">
                <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No upcoming trips</p>
                <p className="text-muted-foreground mb-6">Start planning your next adventure!</p>
                <Button className="bg-gradient-sky text-white" onClick={() => navigate("/search")}>
                  Search Flights
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            <Card className="p-6">
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No past trips</p>
                <p className="text-muted-foreground">Your travel history will appear here</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            <Card className="p-6">
              <div className="text-center py-12">
                <p className="text-lg font-medium mb-2">No cancelled bookings</p>
                <p className="text-muted-foreground">Cancelled trips will appear here</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyTrips;
