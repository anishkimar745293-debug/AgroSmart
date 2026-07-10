import WelcomePanel from "./WelcomePanel";

const AuthLayout = ({ children }) => {
  return (
    <AuthBackground>
      {/* Mobile me h-screen set kiya taaki scroll na ho, p-0 se corners pure screen par stretch honge */}
      <div className="h-screen sm:min-h-screen flex items-center justify-center p-0 sm:p-6">
        
        {/* Mobile par round layout hta kar full screen layout setup kiya h-full flex-col se */}
        <div className="w-full h-full sm:h-auto max-w-7xl bg-white rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
          
          {/* Laptop view panel */}
          <div className="hidden lg:block lg:w-[60%]">
            <WelcomePanel />
          </div>

          {/* Form screen section - Mobile par content flex-1 hoke puri jagah lega */}
          <div className="w-full flex-1 lg:w-[40%] flex items-center justify-center p-6 sm:p-10">
            {children}
          </div>

        </div>

      </div>
    </AuthBackground>
  );
};

const AuthBackground = ({ children }) => {
  return (
    <div className="h-screen bg-gradient-to-br from-green-100 via-white to-green-50 overflow-hidden">
      {children}
    </div>
  );
};

export default AuthLayout;
