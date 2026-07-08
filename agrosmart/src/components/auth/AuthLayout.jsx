import WelcomePanel from "./WelcomePanel";

const AuthLayout = ({ children }) => {
  return (
    <AuthBackground>
      <div className="min-h-screen flex items-center justify-center p-6">

        <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden lg:flex">

          <div className="lg:w-[60%]">
            <WelcomePanel />
          </div>

          <div className="lg:w-[40%] flex items-center justify-center p-10">
            {children}
          </div>

        </div>

      </div>
    </AuthBackground>
  );
};

const AuthBackground = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50">
      {children}
    </div>
  );
};

export default AuthLayout;
