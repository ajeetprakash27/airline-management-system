import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-sky bg-clip-text text-transparent">404</h1>
        </div>
        <h2 className="mb-4 text-3xl font-bold">Page Not Found</h2>
        <p className="mb-8 text-xl text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button className="bg-gradient-sky text-white">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link to="/search">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Search Flights
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
