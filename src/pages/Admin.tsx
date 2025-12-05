import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Users, MapPin, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      navigate("/");
      return;
    }

    setIsAdmin(true);
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your airline operations</p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">0</p>
                <DollarSign className="h-8 w-8 text-primary/20" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">+0% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">$0</p>
                <TrendingUp className="h-8 w-8 text-primary/20" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">$0 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Flights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">0</p>
                <Plane className="h-8 w-8 text-primary/20" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Scheduled today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Passengers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">0</p>
                <Users className="h-8 w-8 text-primary/20" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Registered users</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="flights" className="space-y-6">
          <TabsList>
            <TabsTrigger value="flights">
              <Plane className="h-4 w-4 mr-2" />
              Flights
            </TabsTrigger>
            <TabsTrigger value="airports">
              <MapPin className="h-4 w-4 mr-2" />
              Airports
            </TabsTrigger>
            <TabsTrigger value="aircrafts">
              <Plane className="h-4 w-4 mr-2" />
              Aircrafts
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flights">
            <Card>
              <CardHeader>
                <CardTitle>Flight Management</CardTitle>
                <CardDescription>Schedule and manage flight instances</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No flights scheduled. Create your first flight to get started.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="airports">
            <Card>
              <CardHeader>
                <CardTitle>Airport Management</CardTitle>
                <CardDescription>Manage airports, codes, and terminal information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No airports added. Add airports to enable flight routing.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aircrafts">
            <Card>
              <CardHeader>
                <CardTitle>Aircraft Management</CardTitle>
                <CardDescription>Manage your fleet and seat configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No aircraft registered. Add aircraft to your fleet.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>View and manage all bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No bookings yet. Bookings will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
