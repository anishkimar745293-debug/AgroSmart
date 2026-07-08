import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

import InputField from "./InputField";
import PasswordField from "./PasswordField";
import AuthButton from "./AuthButton";

import { loginUser } from "../../services/loginService";
import { db } from "../../firebase/firebase";
import { USER_ROLES } from "../../constants/appConstants";

const LoginForm = ({ role, setExternalRole }) => {
  // 1: Role Selection, 2: Login ID, 3: Password
  const [loginStep, setLoginStep] = useState(1);

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Input Box Reference Matrix for Auto-Focus
  const inputRef = useRef(null);

  // Jab bhi step 2 ya 3 change hoga, cursor automatically text box me aa jayega
  useEffect(() => {
    if (loginStep === 2 || loginStep === 3) {
      // Small timeout is added to ensure DOM nodes are painted securely
      setTimeout(() => {
        const activeInput = document.querySelector('input[name="loginId"], input[name="password"]');
        if (activeInput) activeInput.focus();
      }, 50);
    }
  }, [loginStep]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Explicitly trigger external state updates immediately
  const handleRoleSelect = (newRole) => {
    if (setExternalRole) {
      setExternalRole(newRole);
    }
  };

  // Step 2 Validation and Firebase Firestore Cross-Check Engine
  const handleNextStep = async (e) => {
    e.preventDefault();
    
    if (loginStep === 2) {
      const inputId = formData.loginId.trim();
      if (!inputId) {
        toast.error("Please enter your Email / Phone / User ID");
        return;
      }

      setLoading(true);

      try {
        // Selected role ke mutabik database collection filter load karna
        const collectionName = role === USER_ROLES.FARMER ? "farmers" : "experts";
        const targetCollectionRef = collection(db, collectionName);

        // Sub queries map dynamically checking all 3 authentication identities
        const emailQuery = query(targetCollectionRef, where("email", "==", inputId.toLowerCase()));
        const phoneQuery = query(targetCollectionRef, where("phone", "==", inputId));
        const userIdQuery = query(targetCollectionRef, where("userId", "==", inputId));

        const [emailSnap, phoneSnap, userIdSnap] = await Promise.all([
          getDocs(emailQuery),
          getDocs(phoneQuery),
          getDocs(userIdQuery)
        ]);

        // Agar account kisi bhi field se mapping nahi ho pata, tab block step trigger hoga
        if (emailSnap.empty && phoneSnap.empty && userIdSnap.empty) {
          toast.error("No user found with these details.");
          setLoading(false);
          return;
        }

        // Account exist karta hai, abhi next state generate hogi
        setLoginStep(3);
      } catch (error) {
        console.error("Verification error:", error);
        toast.error("Network problem. Try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBackStep = () => {
    setLoginStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const user = await loginUser(formData.loginId, formData.password);

      const collection = role === USER_ROLES.FARMER ? "farmers" : "experts";
      const snapshot = await getDoc(doc(db, collection, user.uid));

      if (!snapshot.exists()) {
        throw new Error(`${role} account not found.`);
      }

      toast.success("Login Successful");

      if (role === USER_ROLES.FARMER) {
        navigate("/farmer/dashboard");
      } else {
        navigate("/expert/dashboard");
      }
    } catch (error) {
      console.log(error);
      if (error.code === "auth/wrong-password" || error.message.includes("password")) {
        toast.error("Incorrect password. Please try again.");
      } else {
        toast.error(error.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Title block */}
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          {loginStep === 1 ? "Welcome to Portal" : role === USER_ROLES.FARMER ? "Farmer Login" : "Expert Login"}
        </h2>
        {loginStep === 1 && (
          <p className="text-sm text-gray-500 mt-2">Select your profile to continue</p>
        )}
      </div>

      {/* STEP 1: Card-Based Selection */}
      {loginStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            
            {/* Farmer Card */}
            <button
              type="button"
              onClick={() => handleRoleSelect(USER_ROLES.FARMER)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer ${
                role === USER_ROLES.FARMER
                  ? "bg-green-50 border-green-600 shadow-sm ring-1 ring-green-600"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-4xl mb-3">🌾</span>
              <span className={`font-semibold text-lg ${role === USER_ROLES.FARMER ? "text-green-700" : "text-gray-700"}`}>
                Farmer
              </span>
            </button>

            {/* Expert Card */}
            <button
              type="button"
              onClick={() => handleRoleSelect(USER_ROLES.EXPERT)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer ${
                role === USER_ROLES.EXPERT
                  ? "bg-blue-50 border-blue-600 shadow-sm ring-1 ring-blue-600"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-4xl mb-3">👨‍🌾</span>
              <span className={`font-semibold text-lg ${role === USER_ROLES.EXPERT ? "text-blue-700" : "text-gray-700"}`}>
                Expert
              </span>
            </button>

          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => setLoginStep(2)}
              className="w-full rounded-xl py-4 font-semibold text-white bg-green-600 hover:bg-green-700 transition shadow-md cursor-pointer"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate(`/register?role=${role || USER_ROLES.FARMER}`)}
              className="w-full rounded-xl py-4 font-semibold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition cursor-pointer"
            >
              Register
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Identifier Input */}
      {loginStep === 2 && (
        <form onSubmit={handleNextStep} className="space-y-6">
          <InputField
            label="Email / Phone / User ID"
            name="loginId"
            placeholder="Enter Email / Phone / User ID"
            value={formData.loginId}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={handleBackStep}
              disabled={loading}
              className="w-full rounded-xl py-4 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-4 font-semibold text-white bg-green-600 hover:bg-green-700 transition shadow-md disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Next"}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Password Input */}
      {loginStep === 3 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <PasswordField
            label="Password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            name="password"
          />

          <div className="text-right">
            <Link to="/forgot-password" className="text-green-600 hover:underline text-sm font-medium">
              Forgot Password?
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={handleBackStep}
              disabled={loading}
              className="w-full rounded-xl py-4 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
            >
              Back
            </button>
            <AuthButton
              text={loading ? "Logging In..." : "Login"}
              disabled={loading}
            />
          </div>
        </form>
      )}
    </div>
  );
};

export default LoginForm;

