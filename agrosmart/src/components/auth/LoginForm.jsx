// components/auth/LoginForm.jsx
import { useState, useEffect } from "react";
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
  const [loginStep, setLoginStep] = useState(1);
  const [formData, setFormData] = useState({ loginId: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const primaryBg = role === USER_ROLES.EXPERT ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700";
  const secondaryBg = role === USER_ROLES.EXPERT ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
  const textColor = role === USER_ROLES.EXPERT ? "text-blue-600" : "text-green-600";

  useEffect(() => {
    if (loginStep === 2 || loginStep === 3) {
      setTimeout(() => {
        const activeInput = document.querySelector('input[name="loginId"], input[name="password"]');
        if (activeInput) activeInput.focus();
      }, 50);
    }
  }, [loginStep]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Input fields par Enter key dabaane ka handler
  const handleKeyDown = (e, targetStep) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Default submission reload rokega
      if (targetStep === 2) {
        handleNextStep(e);
      } else if (targetStep === 3) {
        handleSubmit(e);
      }
    }
  };

  const handleNextStep = async (e) => {
    if (e) e.preventDefault();
    const inputId = formData.loginId.trim();
    if (!inputId) {
      toast.error("Please enter your Email / Phone / User ID");
      return;
    }
    setLoading(true);
    try {
      const collectionName = role === USER_ROLES.FARMER ? "farmers" : "experts";
      const targetCollectionRef = collection(db, collectionName);
      const emailQuery = query(targetCollectionRef, where("email", "==", inputId.toLowerCase()));
      const phoneQuery = query(targetCollectionRef, where("phone", "==", inputId));
      const userIdQuery = query(targetCollectionRef, where("userId", "==", inputId));

      const [emailSnap, phoneSnap, userIdSnap] = await Promise.all([
        getDocs(emailQuery), getDocs(phoneQuery), getDocs(userIdQuery)
      ]);

      if (emailSnap.empty && phoneSnap.empty && userIdSnap.empty) {
        toast.error("No user found with these details.");
        setLoading(false);
        return;
      }
      setLoginStep(3);
    } catch (error) {
      toast.error("Network problem. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackStep = () => {
    setLoginStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.password) {
      toast.error("Please enter your password");
      return;
    }
    setLoading(true);
    try {
      const user = await loginUser(formData.loginId, formData.password);
      const collectionName = role === USER_ROLES.FARMER ? "farmers" : "experts";
      const snapshot = await getDoc(doc(db, collectionName, user.uid));
      if (!snapshot.exists()) throw new Error(`${role} account not found.`);
      toast.success("Login Successful");
      if (role === USER_ROLES.FARMER) navigate("/farmer/dashboard");
      else navigate("/expert/dashboard");
    } catch (error) {
      toast.error(error.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between min-h-[75vh] sm:min-h-0 space-y-6">
      
      <div className="space-y-6 flex-1 flex flex-col justify-center">
        <div className="text-center mb-2">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {loginStep === 1 ? "Welcome to Portal" : role === USER_ROLES.FARMER ? "Farmer Login" : "Expert Login"}
          </h2>
        </div>

        {/* STEP 1 */}
        {loginStep === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setExternalRole(USER_ROLES.FARMER)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer ${
                role === USER_ROLES.FARMER ? "bg-green-50 border-green-600 shadow-sm ring-1 ring-green-600" : "bg-white border-gray-200"
              }`}
            >
              <span className="text-4xl mb-3">👨‍🌾</span>
              <span className="font-semibold text-lg">Farmer</span>
            </button>

            <button
              type="button"
              onClick={() => setExternalRole(USER_ROLES.EXPERT)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer ${
                role === USER_ROLES.EXPERT ? "bg-blue-50 border-blue-600 shadow-sm ring-1 ring-blue-600" : "bg-white border-gray-200"
              }`}
            >
              <span className="text-4xl mb-3">👨‍🔬</span>
              <span className="font-semibold text-lg">Expert</span>
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {loginStep === 2 && (
          <div className="w-full" onKeyDown={(e) => handleKeyDown(e, 2)}>
            <InputField
              label="Email / Phone / User ID"
              name="loginId"
              placeholder="Enter Email / Phone / User ID"
              value={formData.loginId}
              onChange={handleChange}
            />
          </div>
        )}

        {/* STEP 3 */}
        {loginStep === 3 && (
          <div className="w-full space-y-4" onKeyDown={(e) => handleKeyDown(e, 3)}>
            <PasswordField
              label="Password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              name="password"
            />
            <div className="text-right">
              <Link to="/forgot-password" className={`${textColor} hover:underline text-sm font-medium`}>
                Forgot Password?
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Buttons Block */}
      <div className="pt-4 border-t border-gray-100 sm:border-t-0">
        {loginStep === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setLoginStep(2)} className={`w-full rounded-xl py-4 font-semibold text-white transition shadow-md ${primaryBg}`}>
              Login
            </button>
            <button type="button" onClick={() => navigate(`/register?role=${role || USER_ROLES.FARMER}`)} className={`w-full rounded-xl py-4 font-semibold border transition ${secondaryBg}`}>
              Register
            </button>
          </div>
        )}

        {loginStep === 2 && (
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={handleBackStep} className="w-full rounded-xl py-4 font-semibold text-gray-700 bg-gray-100">
              Back
            </button>
            <button type="button" onClick={handleNextStep} disabled={loading} className={`w-full rounded-xl py-4 font-semibold text-white transition shadow-md ${primaryBg}`}>
              {loading ? "Verifying..." : "Next"}
            </button>
          </div>
        )}

        {loginStep === 3 && (
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={handleBackStep} className="w-full rounded-xl py-4 font-semibold text-gray-700 bg-gray-100">
              Back
            </button>
            <AuthButton text={loading ? "Logging In..." : "Login"} disabled={loading} role={role} onClick={handleSubmit} />
          </div>
        )}
      </div>

    </div>
  );
};

export default LoginForm;



