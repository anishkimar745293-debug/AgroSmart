
import AuthLayout from "../../components/auth/AuthLayout";
import { useState } from "react";
import { motion } from "framer-motion";
import Logo from "../../components/common/Logo";
import LoginForm from "../../components/Auth/LoginForm";
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
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-gray-100 p-10"
    >
      <Logo />

      <div className="mt-2">
        {/* Pass state and setter straight to LoginForm */}
        <LoginForm role={selectedRole} setExternalRole={setSelectedRole} />
      </div>
    </motion.div>
  );
};



export default LoginPage;