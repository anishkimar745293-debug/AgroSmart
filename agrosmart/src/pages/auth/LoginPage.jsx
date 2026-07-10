// pages/auth/LoginPage.jsx
import AuthLayout from "../../components/auth/AuthLayout";
import { useState } from "react";
import { motion } from "framer-motion";
import Logo from "../../components/common/Logo";
import LoginForm from "../../components/auth/LoginForm"; // Sahi lowercase path
import { USER_ROLES } from "../../constants/appConstants";

const LoginPage = () => {
  return (
    <AuthLayout>
      <AuthCard />
    </AuthLayout>
  );
};

const AuthCard = () => {
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.FARMER);

  return (
    <div className="w-full max-w-xl h-full flex flex-col justify-between sm:min-h-0 py-2 sm:py-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full rounded-3xl bg-white shadow-2xl border border-gray-100 p-6 sm:p-10 flex-1 flex flex-col justify-center"
      >
        <Logo />
        <div className="mt-4 flex-1 flex flex-col justify-center">
          <LoginForm role={selectedRole} setExternalRole={setSelectedRole} />
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
