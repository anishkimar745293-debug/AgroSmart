import { useNavigate } from "react-router-dom"; // Navigation hook import kiya
import DashboardLayout from "../../layouts/DashboardLayout";
import QuickActions from "../../components/farmer/QuickActions";
import ConnectExpertButton from "../../components/farmer/ConnectExpertButton";
import { Users, MessageSquare, ArrowRight } from "lucide-react";

const FarmerDashboard = () => {
  const navigate = useNavigate(); // Hook initialize kiya
  const availableExpertsCount = 24; 
  const recentChatsCount = 2; // Aap isko backend length se active rakh sakte hain

  return (
    <DashboardLayout role="farmer">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Simple & Clean Welcome Banner */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-md">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome to AgroSmart 👋</h1>
          <p className="text-green-100 text-sm max-w-xl mt-2 font-medium leading-relaxed">
            Apne fasal ki samasya ke liye turant experts se judein ya hamare advanced AI tools ka upayog karein.
          </p>
        </div>

        {/* Available Experts Display & Connect Component */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Experts</p>
                <h3 className="text-2xl font-black text-gray-950 mt-0.5">{availableExpertsCount} Online Now</h3>
              </div>
            </div>
            <span className="hidden sm:flex h-3 w-3 relative mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>

          {/* Connect Area Render */}
          <div className="w-full flex justify-start">
            <ConnectExpertButton />
          </div>
        </div>

        {/* AI Tools Section */}
        <QuickActions />

        {/* Recent Chats Section - Single Redirect Button */}
        <div className="space-y-4">
          <button 
            onClick={() => navigate("/recent-chats")} // 👈 Click karte hi redirect ho jayega
            className="w-full flex items-center justify-between bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:bg-gray-50 hover:shadow-md transition duration-200 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors duration-200">
                <MessageSquare size={22} />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
                  Recent Chats 
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {recentChatsCount}
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Apni purani saari baatchit aur messages dekhne ke liye yahan click karein.</p>
              </div>
            </div>
            
            {/* Arrow icon highlighting redirection */}
            <div className="text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition mr-2">
              <ArrowRight size={22} />
            </div>
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;



