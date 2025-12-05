import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, User, Menu, LogOut, Radio } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
      description: "See you soon!",
    });
    navigate("/");
  };

  const NavLinks = () => (
    <>
      <Link to="/">
        <Button variant="ghost" className="text-foreground hover:text-primary">
          Home
        </Button>
      </Link>
      <Link to="/search">
        <Button variant="ghost" className="text-foreground hover:text-primary">
          Search Flights
        </Button>
      </Link>
      <Link to="/flight-status">
        <Button variant="ghost" className="text-foreground hover:text-primary flex items-center gap-1">
          <Radio className="h-3 w-3 text-green-500 animate-pulse" />
          Live Status
        </Button>
      </Link>
      {user && (
        <>
          <Link to="/my-trips">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              My Trips
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Profile
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-sky">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-sky bg-clip-text text-transparent">
              Scalebrand Airlines
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLinks />
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/profile")}
                  className="text-foreground hover:text-primary"
                >
                  <User className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?mode=register">
                  <Button size="sm" className="bg-gradient-sky text-white hover:opacity-90">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                <NavLinks />
                <div className="border-t pt-4">
                  {user ? (
                    <Button onClick={handleLogout} variant="outline" className="w-full">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  ) : (
                    <>
                      <Link to="/auth" className="block mb-2">
                        <Button variant="outline" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/auth?mode=register">
                        <Button className="w-full bg-gradient-sky text-white">
                          Register
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
