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

    // URL parameter se role read karna (?role=farmer or ?role=expert)
    const urlRole = searchParams.get("role");
    const selectedRole = urlRole || USER_ROLES.FARMER;

    // 6 Step Wizard System State
    const [step, setStep] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Auto-focus input reference
    const inputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        userId: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
        agree: false,
    });

    const [loading, setLoading] = useState(false);

    // Jab bhi step change ho, cursor automatically text input box me aa jaye
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [step]);

    const handleChange = (field, value) => {
        // PHONE NUMBER RESTRICTION: Sirf number enter ho aur max 10 digit
        if (field === "phone") {
            const onlyNums = value.replace(/[^0-9]/g, ""); // Pure numbers filter
            if (onlyNums.length > 10) return; // 10 digit se aage type nahi hone dega
            
            setFormData((prev) => ({
                ...prev,
                [field]: onlyNums,
            }));
            return;
        }

        // Baaki fields ke liye normal state update
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Step-by-Step Backend Cross-Role Verification Logic
    const handleNextStep = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // STEP 1: Name Validation
            if (step === 1) {
                if (!formData.name.trim()) {
                    toast.error("Full Name is required.");
                    setLoading(false);
                    return;
                }
                setStep(2);
            } 
            
            // STEP 2: Email Validation (Cross-Role Check)
            else if (step === 2) {
                const cleanEmail = formData.email.trim().toLowerCase();
                if (!cleanEmail) {
                    toast.error("Email Address is required.");
                    setLoading(false);
                    return;
                }

                const farmerEmailQuery = query(collection(db, "farmers"), where("email", "==", cleanEmail));
                const expertEmailQuery = query(collection(db, "experts"), where("email", "==", cleanEmail));

                const [farmerSnapshot, expertSnapshot] = await Promise.all([
                    getDocs(farmerEmailQuery),
                    getDocs(expertEmailQuery)
                ]);

                if (!farmerSnapshot.empty || !expertSnapshot.empty) {
                    toast.error("This email has been used.");
                    setLoading(false);
                    return;
                }

                setStep(3);
            } 
            
            // STEP 3: User ID Validation (Cross-Role Check)
            else if (step === 3) {
                const cleanUserId = formData.userId.trim();
                if (!cleanUserId) {
                    toast.error("User ID is required.");
                    setLoading(false);
                    return;
                }

                const farmerUidQuery = query(collection(db, "farmers"), where("userId", "==", cleanUserId));
                const expertUidQuery = query(collection(db, "experts"), where("userId", "==", cleanUserId));

                const [farmerSnapshot, expertSnapshot] = await Promise.all([
                    getDocs(farmerUidQuery),
                    getDocs(expertUidQuery)
                ]);
                
                if (!farmerSnapshot.empty || !expertSnapshot.empty) {
                    toast.error("This User ID has been used.");
                    setLoading(false);
                    return;
                }
                
                setStep(4);
            } 
            
            // STEP 4: Phone Number Validation (Exact 10 Digit Check + Cross-Role Check)
            else if (step === 4) {
                const cleanPhone = formData.phone.trim();
                if (!cleanPhone) {
                    toast.error("Phone Number is required.");
                    setLoading(false);
                    return;
                }

                // Check for exactly 10 digits
                if (cleanPhone.length !== 10) {
                    toast.error("Phone number must be exactly 10 digits.");
                    setLoading(false);
                    return;
                }

                const farmerPhoneQuery = query(collection(db, "farmers"), where("phone", "==", cleanPhone));
                const expertPhoneQuery = query(collection(db, "experts"), where("phone", "==", cleanPhone));

                const [farmerSnapshot, expertSnapshot] = await Promise.all([
                    getDocs(farmerPhoneQuery),
                    getDocs(expertPhoneQuery)
                ]);
                
                if (!farmerSnapshot.empty || !expertSnapshot.empty) {
                    toast.error("This phone number has been used.");
                    setLoading(false);
                    return;
                }
                
                setStep(5);
            } 
            
            // STEP 5: Address Validation
            else if (step === 5) {
                if (!formData.address.trim()) {
                    toast.error("Address is required.");
                    setLoading(false);
                    return;
                }
                setStep(6);
            }
        } catch (error) {
            console.error("Validation error:", error);
            toast.error("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleBackStep = () => {
        if (step === 1) {
            navigate("/");
        } else {
            setStep((prev) => prev - 1);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!formData.password || formData.password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        if (!formData.agree) {
            toast.error("You must agree to the Terms & Conditions.");
            return;
        }

        setLoading(true);

        try {
            await registerUser(selectedRole, formData);
            
            // Success hone par custom Tailwind popup modal dikhega
            setShowSuccessModal(true);

            // Form clean reset
            setFormData({
                name: "",
                email: "",
                userId: "",
                phone: "",
                address: "",
                password: "",
                confirmPassword: "",
                agree: false,
            });
        } catch (error) {
            toast.error(error.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setShowSuccessModal(false);
        navigate("/"); // OK click karte hi login page par redirect
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-10 relative"
            >
                <Logo />

                <div className="text-center mt-6">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 capitalize">
                        {selectedRole === "farmer" ? "Farmer" : "Expert"} Registration
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Step {step} of 6 — Fill details sequentially
                    </p>
                    
                    {/* Dynamic Progress Bar */}
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div 
                            className="bg-green-600 h-full transition-all duration-300" 
                            style={{ width: `${(step / 6) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="mt-8">
                    {step < 6 ? (
                        <form onSubmit={handleNextStep} className="space-y-6">
                            
                            {/* STEP 1: Name Input with Auto-Focus */}
                            {step === 1 && (
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">Full Name</label>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        className="w-full border rounded-xl px-4 py-3 outline-none focus:border-green-600 border-gray-300"
                                    />
                                </div>
                            )}

                            {/* STEP 2: Email Input with Auto-Focus */}
                            {step === 2 && (
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">Email Address</label>
                                    <input
                                        ref={inputRef}
                                        type="email"
                                        placeholder="Enter email address"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        className="w-full border rounded-xl px-4 py-3 outline-none focus:border-green-600 border-gray-300"
                                    />
                                </div>
                            )}

                            {/* STEP 3: User ID Input with Auto-Focus */}
                            {step === 3 && (
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">User ID</label>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Choose a unique user ID"
                                        value={formData.userId}
                                        onChange={(e) => handleChange("userId", e.target.value)}
                                        className="w-full border rounded-xl px-4 py-3 outline-none focus:border-green-600 border-gray-300"
                                    />
                                </div>
                            )}

                            {/* STEP 4: Phone Number Input with Auto-Focus & Number Restriction */}
                            {step === 4 && (
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">Phone Number</label>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Enter 10 digit phone number"
                                        value={formData.phone}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        className="w-full border rounded-xl px-4 py-3 outline-none focus:border-green-600 border-gray-300"
                                    />
                                </div>
                            )}

                            {/* STEP 5: Address Input with Auto-Focus */}
                            {step === 5 && (
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">Address</label>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Enter your resident address"
                                        value={formData.address}
                                        onChange={(e) => handleChange("address", e.target.value)}
                                        className="w-full border rounded-xl px-4 py-3 outline-none focus:border-green-600 border-gray-300"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={handleBackStep}
                                    disabled={loading}
                                    className="w-full rounded-xl py-4 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 cursor-pointer text-center"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl py-4 font-semibold text-white bg-green-600 hover:bg-green-700 transition shadow-md disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? "Checking Database..." : "Next"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Step 6: Password Inputs & Finalize */
                        <form onSubmit={handleRegister} className="space-y-6">
                            <PasswordField
                                inputRef={inputRef}
                                label="Password"
                                placeholder="Minimum 8 Characters"
                                value={formData.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                            />

                            <PasswordField
                                label="Confirm Password"
                                placeholder="Re-enter Password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                            />

                            <div className="space-y-1 pt-2">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="agree-terms"
                                        checked={formData.agree}
                                        onChange={(e) => handleChange("agree", e.target.checked)}
                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                    />
                                    <label htmlFor="agree-terms" className="text-gray-700 select-none text-sm cursor-pointer">
                                        I agree to the Terms & Conditions
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleBackStep}
                                    disabled={loading}
                                    className="w-full rounded-xl py-4 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 cursor-pointer"
                                >
                                    Back
                                </button>
                                <AuthButton
                                    text={loading ? "Creating Account..." : "Register"}
                                    disabled={loading}
                                />
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>

            {/* TAILWIND MODAL POPUP */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-100"
                        >
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                                <span className="text-3xl text-green-600">📩</span>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-950 mb-3">
                                Verify Your Email
                            </h3>
                            
                            <p className="text-gray-600 leading-relaxed text-sm mb-6">
                                Aapki registration successful ho gayi hai! Kripya apne <span className="font-semibold text-gray-900">Email inbox</span> me jaakar account confirm karein. Agar link na mile, toh ek baar apna <span className="font-semibold text-red-600">Spam Folder</span> zaroor check karein.
                            </p>

                            <button
                                type="button"
                                onClick={handleModalClose}
                                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md active:scale-[0.98] transition cursor-pointer"
                            >
                                OK
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default RegisterCard;

