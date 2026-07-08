import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Logo from "../common/Logo";
import InputField from "./InputField";
import AuthButton from "./AuthButton";

import { resetPassword } from "../../services/forgotPasswordService";

const ForgotPasswordCard = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const result = await resetPassword(email);

      toast.success(result.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
      <Logo />

      <h2 className="text-3xl font-bold text-center mt-8">
        Forgot Password
      </h2>

      <p className="text-center text-gray-500 mt-2">
        Enter your registered email address.
      </p>

      <form onSubmit={handleReset} className="mt-8 space-y-5">
        <InputField
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthButton
          text={loading ? "Sending..." : "Send Reset Link"}
          disabled={loading}
        />
      </form>

      <div className="text-center mt-6">
        <Link
          to="/"
          className="text-green-600 font-semibold hover:underline"
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordCard;