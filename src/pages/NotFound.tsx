import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center max-w-md animate-fadeIn">
        <h1 className="text-6xl font-extrabold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found.</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition transform hover:scale-105 hover:animate-bounce"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
