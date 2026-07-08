import Navbar from "../components/farmer/Navbar"; // Aapke folder structure ke hisab se path sahi kar lein

const DashboardLayout = ({ children, role }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sidebar yahan se poori tarah hata diya gaya hai */}
      
      {/* Navbar me role bhej rahe hain */}
      <Navbar role={role} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

