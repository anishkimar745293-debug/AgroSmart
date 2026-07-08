import { Bell, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Hook imported

const Navbar = ({ role }) => {
  const navigate = useNavigate(); // ✅ FIX: Hook initialize kiya yahan

  // Role ke hisab se dynamic Tailwind classes select karna
  const isFarmer = role === "farmer";
  const navBgColor = isFarmer ? "bg-green-600 text-white" : "bg-blue-600 text-white";
  const dashboardTitle = isFarmer ? "Farmer Dashboard" : "Expert Dashboard";

  return (
    <header className={`${navBgColor} shadow flex justify-between items-center px-8 py-4 transition-colors duration-300`}>

      <h1 className="text-2xl font-bold">
        {dashboardTitle}
      </h1>

      <div className="flex items-center gap-6">
        <Bell
          className="cursor-pointer hover:opacity-80"
          size={24}
        />

        <UserCircle
          size={34}
          className="cursor-pointer transition-transform hover:scale-105 hover:opacity-80"
          // ✅ FIX: State me role pass kiya taaki profile page recognize kar sake
          onClick={() => navigate("/profile", { state: { role } })} 
        />
      </div>

    </header>
  );
};

export default Navbar;
