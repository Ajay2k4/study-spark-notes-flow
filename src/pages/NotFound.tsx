
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-spark-50 to-ocean-50 p-6">
      <div className="text-center max-w-md">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col items-center">
          <div className="bg-spark-100 text-spark-600 p-4 rounded-full mb-4">
            <FileQuestion className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-bold mb-2">404</h1>
          <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button className="bg-spark-600 hover:bg-spark-700">
              Return to Home
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Need help? <a href="#" className="text-spark-600 hover:underline">Contact support</a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
