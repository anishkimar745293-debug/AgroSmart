import { useNavigate } from "react-router-dom";
import { Sprout, ShieldAlert } from "lucide-react"; // Zaroori icons

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Card 1: AI Crop Advisory */}
      <div 
        onClick={() => navigate("/farmer/crop-advisory")}
        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all duration-300 cursor-pointer group flex gap-4 items-start"
      >
        <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
          <Sprout size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition">AI Crop Advisory</h3>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">
            Mitti, mausam aur fasal ke aadhar par AI se behtar kheti ki salah lein.
          </p>
        </div>
      </div>

      {/* Card 2: Disease Detection (Disease Lab) */}
      <div 
        onClick={() => navigate("/farmer/disease-lab")}
        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all duration-300 cursor-pointer group flex gap-4 items-start"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition">Disease Detection</h3>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">
            Fasal ke bimar patto ki photo upload karein aur bimari ka turant pata lagayein.
          </p>
        </div>
      </div>

    </div>
  );
};

export default QuickActions;



