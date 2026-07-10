import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { registerUser } from "../../services/authService";

import toast from "react-hot-toast";
import Logo from "../common/Logo";
import PasswordField from "./PasswordField";
import AuthButton from "./AuthButton";
import { USER_ROLES } from "../../constants/appConstants";

const RegisterCard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const urlRole = searchParams.get("role");
    const selectedRole = urlRole || USER_ROLES.FARMER;

    const [step, setStep] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const inputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "", email: "", userId: "", phone: "", address: "",
        password: "", confirmPassword: "", agree: false,
    });
    const [loading, setLoading] = useState(false);

    const isExpert = selectedRole === USER_ROLES.EXPERT;
    const progressColor = isExpert ? "bg-blue-600" : "bg-green-600";
    const primaryBtnBg = isExpert ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700";
    const checkboxRing = isExpert ? "focus:ring-blue-500 text-blue-600" : "focus:ring-green-500 text-green-600";

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [step]);

    const handleChange = (field, value) => {
        if (field === "phone") {
            const onlyNums = value.replace(/[^0-9]/g, "");
            if (onlyNums.length > 10) return;
            setFormData((prev) => ({ ...prev, [field]: onlyNums }));
            return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Input fields par Enter dabane ka trigger check logic
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (step < 6) {
                handleNextStep();
            } else {
                handleRegister();
            }
        }
    };

    const handleNextStep = async () => {
        setLoading(true);
        try {
            if (step === 1) {
                if (!formData.name.trim()) { toast.error("Full Name is required."); setLoading(false); return; }
                setStep(2);
            } 
            else if (step === 2) {
                const cleanEmail = formData.email.trim().toLowerCase();
                if (!cleanEmail) { toast.error("Email Address is required."); setLoading(false); return; }
                
                // === EMAIL FORMAT VALIDATION REGEX ===
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(cleanEmail)) {
                    toast.error("Please enter a valid email format (e.g., user@example.com)");
                    setLoading(false);
                    return;
                }

                const farmerEmailQuery = query(collection(db, "farmers"), where("email", "==", cleanEmail));
                const expertEmailQuery = query(collection(db, "experts"), where("email", "==", cleanEmail));
                const [farmerSnapshot, expertSnapshot] = await Promise.all([getDocs(farmerEmailQuery), getDocs(expertEmailQuery)]);
                if (!farmerSnapshot.empty || !expertSnapshot.empty) { toast.error("This email has been used."); setLoading(false); return; }
                setStep(3);
            } 
            else if (step === 3) {
                const cleanUserId = formData.userId.trim();
                if (!cleanUserId) { toast.error("User ID is required."); setLoading(false); return; }
                const farmerUidQuery = query(collection(db, "farmers"), where("userId", "==", cleanUserId));
                const expertUidQuery = query(collection(db, "experts"), where("userId", "==", cleanUserId));
                const [farmerSnapshot, expertSnapshot] = await Promise.all([getDocs(farmerUidQuery), getDocs(expertUidQuery)]);
                if (!farmerSnapshot.empty || !expertSnapshot.empty) { toast.error("This User ID has been used."); setLoading(false); return; }
                setStep(4);
            } 
            else if (step === 4) {
                const cleanPhone = formData.phone.trim();
                if (!cleanPhone) { toast.error("Phone Number is required."); setLoading(false); return; }
                if (cleanPhone.length !== 10) { toast.error("Phone number must be exactly 10 digits."); setLoading(false); return; }
                const farmerPhoneQuery = query(collection(db, "farmers"), where("phone", "==", cleanPhone));
                const expertPhoneQuery = query(collection(db, "experts"), where("phone", "==", cleanPhone));
                const [farmerSnapshot, expertSnapshot] = await Promise.all([getDocs(farmerPhoneQuery), getDocs(expertPhoneQuery)]);
                if (!farmerSnapshot.empty || !expertSnapshot.empty) { toast.error("This phone number has been used."); setLoading(false); return; }
                setStep(5);
            } 
            else if (step === 5) {
                if (!formData.address.trim()) { toast.error("Address is required."); setLoading(false); return; }
                setStep(6);
            }
        } catch (error) {
            toast.error("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleBackStep = () => {
        if (step === 1) navigate("/");
        else setStep((prev) => prev - 1);
    };

    const handleRegister = async () => {
        if (!formData.password || formData.password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
        if (formData.password !== formData.confirmPassword) { toast.error("Passwords do not match."); return; }
        if (!formData.agree) { toast.error("You must agree to the Terms & Conditions."); return; }
        setLoading(true);
        try {
            await registerUser(selectedRole, formData);
            setShowSuccessModal(true);
            setFormData({ name: "", email: "", userId: "", phone: "", address: "", password: "", confirmPassword: "", agree: false });
        } catch (error) {
            toast.error(error.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="w-full max-w-xl h-full flex flex-col justify-between min-h-[82vh] sm:min-h-0 py-2 sm:py-0" onKeyDown={handleKeyDown}>
                
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-3xl shadow-2xl w-full p-8 sm:p-10 border border-gray-100 flex-1 flex flex-col justify-center"
                >
                    <Logo />
                    <div className="text-center mt-4">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 capitalize">
                            {isExpert ? "Expert" : "Farmer"} Registration
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Step {step} of 6</p>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${progressColor}`} style={{ width: `${(step / 6) * 100}%` }} />
                        </div>
                    </div>

                    <div className="mt-6 flex-1 flex flex-col justify-center">
                        {step === 1 && (
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Full Name</label>
                                <input ref={inputRef} type="text" placeholder="Enter full name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} className="w-full border rounded-xl px-4 py-3 outline-none focus:border-green-600 border-gray-300" />
                            </div>
                        )}
                        {step === 2 && (
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Email Address</label>
                                <input ref={inputRef} type="email" placeholder="Enter email address" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className="w-full border rounded-xl px-4 py-3 outline-none focus:border-green-600 border-gray-300" />
                            </div>
                        )}
                        {step === 3 && (
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">User ID</label>
                                <input ref={inputRef} type="text" placeholder="Choose unique user ID" value={formData.userId} onChange={(e) => handleChange("userId", e.target.value)} className="w-full border rounded-xl px-4 py-3 outline-none focus:border-green-600 border-gray-300" />
                            </div>
                        )}
                        {step === 4 && (
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Phone Number</label>
                                <input ref={inputRef} type="text" placeholder="Enter 10 digit phone number" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} className="w-full border rounded-xl px-4 py-3 outline-none focus:border-green-600 border-gray-300" />
                            </div>
                        )}
                        {step === 5 && (
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Address</label>
                                <input ref={inputRef} type="text" placeholder="Enter address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} className="w-full border rounded-xl px-4 py-3 outline-none focus:border-green-600 border-gray-300" />
                            </div>
                        )}
                        {step === 6 && (
                            <div className="space-y-4">
                                <PasswordField inputRef={inputRef} label="Password" placeholder="Minimum 8 Characters" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} />
                                <PasswordField label="Confirm Password" placeholder="Re-enter Password" value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} />
                                <div className="flex items-center gap-3 pt-1">
                                    <input type="checkbox" id="agree-terms" checked={formData.agree} onChange={(e) => handleChange("agree", e.target.checked)} className={`w-4 h-4 border-gray-300 rounded cursor-pointer ${checkboxRing}`} />
                                    <label htmlFor="agree-terms" className="text-gray-700 text-sm cursor-pointer select-none">I agree to Terms & Conditions</label>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Buttons block */}
                <div className="grid grid-cols-2 gap-4 mt-6 px-2 sm:px-0">
                    <button type="button" onClick={handleBackStep} className="w-full rounded-xl py-4 font-semibold text-gray-700 bg-gray-200 text-center">
                        Back
                    </button>
                    
                    {step < 6 ? (
                        <button type="button" onClick={handleNextStep} disabled={loading} className={`w-full rounded-xl py-4 font-semibold text-white transition shadow-md ${primaryBtnBg}`}>
                            {loading ? "Checking..." : "Next"}
                        </button>
                    ) : (
                        <AuthButton text={loading ? "Registering..." : "Register"} disabled={loading} role={selectedRole} onClick={handleRegister} />
                    )}
                </div>

            </div>

            {/* Success Modal remains intact */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                                <span className="text-3xl text-blue-600">📩</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-950 mb-3">Verify Your Email</h3>
                            <p className="text-gray-600 text-sm mb-6 leading-relaxed">Aapki registration successful ho gayi hai! Kripya inbox check karein.</p>
                            <button type="button" onClick={() => { setShowSuccessModal(false); navigate("/"); }} className={`w-full py-3.5 text-white font-semibold rounded-xl shadow-md ${primaryBtnBg}`}>OK</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default RegisterCard;
