import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-6">
      <h1 className="text-8xl font-bold text-red-500">
        404
      </h1>

      <p className="text-xl">
        Page Not Found
      </p>

      <Link
        to="/"
        className="bg-green-600 text-white px-6 py-3 rounded-lg"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;