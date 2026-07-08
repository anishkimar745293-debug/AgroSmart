import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, MapPin, Shield, Loader2, Edit, Trash2, LogOut, Lock, Save, X, Eye, EyeOff } from "lucide-react";
import { auth, db } from "../../firebase/firebase";
import { doc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentRole = location.state?.role || "farmer";
  const isFarmer = currentRole === "farmer";
  const targetCollection = isFarmer ? "farmers" : "experts";

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Profile Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "" });
  const [btnLoading, setBtnLoading] = useState(false);

  // Password Modal States
  const [showPassModal, setShowPassModal] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "" });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, targetCollection, currentUser.uid);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data);
          setEditForm({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || ""
          });
        } else {
          console.warn("No record found inside Firestore.");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore synchronizer error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [targetCollection]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed.");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.phone.trim() || !editForm.address.trim()) {
      toast.error("All fields are required!");
      return;
    }
    if (editForm.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    setBtnLoading(true);
    try {
      const currentUser = auth.currentUser;
      const docRef = doc(db, targetCollection, currentUser.uid);
      
      await updateDoc(docRef, {
        name: editForm.name,
        phone: editForm.phone,
        address: editForm.address
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile: " + error.message);
    } finally {
      setBtnLoading(false);
    }
  };

  // Direct Password Change Functionality
  const handleUpdatePasswordSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;

    if (!passForm.currentPassword || !passForm.newPassword) {
      toast.error("Dono fields fill karna zaroori hai!");
      return;
    }

    if (passForm.newPassword.length < 8) {
      toast.error("Naya password kam se kam 8 characters ka hona chahiye.");
      return;
    }

    // ✅ FIXED: Same password check validation added
    if (passForm.currentPassword === passForm.newPassword) {
      toast.error("Naya password aapke purane password se alag hona chahiye!");
      return;
    }

    setPassLoading(true);
    try {
      // 1. Credential verification
      const credential = EmailAuthProvider.credential(currentUser.email, passForm.currentPassword);
      
      // 2. Re-authenticate matching check
      await reauthenticateWithCredential(currentUser, credential);
      
      // 3. Cloud secure update action
      await updatePassword(currentUser, passForm.newPassword);

      toast.success("Password successfully change ho gaya!");
      
      setPassForm({ currentPassword: "", newPassword: "" });
      setShowPassModal(false);
    } catch (error) {
      console.error(error);
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        toast.error("Current password galat hai! Kripya dobara check karein.");
      } else {
        toast.error("Password update failed: " + error.message);
      }
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Kya aap apna account hamesha ke liye delete karna chahte hain? Yeh action wapas nahi liya ja sakta."
    );
    
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const docRef = doc(db, targetCollection, currentUser.uid);
      await deleteDoc(docRef);
      await deleteUser(currentUser);

      toast.success("Your account has been deleted permanently.");
      navigate("/");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        toast.error("Security Reason: Kripya ek baar log out karke dobara login karein, fir delete karein.");
      } else {
        toast.error("Account deletion failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const headerGradient = isFarmer ? "from-green-600 to-emerald-700" : "from-blue-600 to-indigo-700";
  const badgeTheme = isFarmer ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200";
  const actionButtonPrimary = isFarmer ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className={`animate-spin ${isFarmer ? "text-green-600" : "text-blue-600"}`} size={40} />
        <p className="text-gray-500 font-medium">Processing secure cloud action...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
        
        {/* Header navigation bar */}
        <div className={`bg-gradient-to-r ${headerGradient} p-6 text-white flex items-center justify-between`}>
          <button 
            onClick={() => navigate(isFarmer ? "/farmer/dashboard" : "/expert/dashboard")}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm transition cursor-pointer"
            disabled={isEditing}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <h2 className="text-lg font-bold capitalize">
            {isFarmer ? "Farmer Account" : "Expert Account"}
          </h2>
          <div className="w-24"></div>
        </div>

        {/* Core Profile Area */}
        <div className="p-8 space-y-8">
          
          {/* Main Header Avatar & Name Section */}
          <div className="flex flex-col items-center justify-center border-b border-gray-100 pb-8">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border-4 border-gray-100 shadow-inner">
              <User size={48} />
            </div>
            
            <div className="mt-4 w-full max-w-sm text-center">
              {isEditing ? (
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full text-center text-2xl font-bold text-gray-800 border-b-2 border-green-500 outline-none pb-1 bg-transparent px-2"
                  placeholder="Enter Full Name"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-800">
                  {profileData?.name || "AgroUser"}
                </h1>
              )}
            </div>

            <span className={`mt-3 px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${badgeTheme}`}>
              Authorized {currentRole} Profile
            </span>
          </div>

          {/* Form Setup for Info Fields */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex flex-col gap-6">
              
              {/* Field 1: User ID */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">User ID</label>
                <div className={`flex items-center gap-3 bg-gray-100 p-4 rounded-2xl border border-gray-200 text-gray-500 ${isEditing ? 'cursor-not-allowed' : 'cursor-default'}`}>
                  <span className="font-semibold text-sm">@</span>
                  <span className="font-medium font-mono">{profileData?.userId || "Unavailable"}</span>
                </div>
              </div>

              {/* Field 2: Email Address */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
                <div className={`flex items-center gap-3 bg-gray-100 p-4 rounded-2xl border border-gray-200 text-gray-500 ${isEditing ? 'cursor-not-allowed' : 'cursor-default'}`}>
                  <Mail size={18} />
                  <span className="font-medium truncate">{profileData?.email || "Unavailable"}</span>
                </div>
              </div>

              {/* Field 3: Phone Number */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Phone Connection</label>
                <div className={`flex items-center gap-3 p-4 rounded-2xl border transition ${isEditing ? "bg-white border-green-500 focus-within:ring-2 focus-within:ring-green-100" : "bg-gray-50/50 border-gray-200/60"}`}>
                  <Phone size={18} className="text-gray-400" />
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.phone} 
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        if (val.length <= 10) setEditForm({...editForm, phone: val});
                      }}
                      className="w-full outline-none text-gray-700 font-medium cursor-text"
                    />
                  ) : (
                    <span className="font-medium text-gray-700">{profileData?.phone || "Unavailable"}</span>
                  )}
                </div>
              </div>

              {/* Field 4: Address */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Resident Address</label>
                <div className={`flex items-center gap-3 p-4 rounded-2xl border transition ${isEditing ? "bg-white border-green-500 focus-within:ring-2 focus-within:ring-green-100" : "bg-gray-50/50 border-gray-200/60"}`}>
                  <MapPin size={18} className="text-gray-400" />
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.address} 
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="w-full outline-none text-gray-700 font-medium cursor-text"
                    />
                  ) : (
                    <span className="font-medium text-gray-700 truncate">{profileData?.address || "Unavailable"}</span>
                  )}
                </div>
              </div>

            </div>

            {/* Save / Cancel Layout Buttons during Edit Mode */}
            {isEditing && (
              <div className="flex gap-4 pt-2">
                <button 
                  type="submit"
                  disabled={btnLoading}
                  className={`flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-semibold shadow-md active:scale-95 transition cursor-pointer text-sm ${actionButtonPrimary}`}
                >
                  <Save size={16} /> {btnLoading ? "Saving..." : "Save Changes"}
                </button>
                <button 
                  type="button"
                  onClick={() => { setIsEditing(false); }}
                  className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition cursor-pointer text-sm"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </form>

          {/* Action Toolbar */}
          {!isEditing && (
            <div className="pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <button 
                onClick={() => setIsEditing(true)}
                className={`flex items-center justify-center gap-2 text-white p-3 rounded-xl font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer text-sm ${actionButtonPrimary}`}
              >
                <Edit size={16} /> Edit Profile
              </button>

              <button 
                onClick={() => setShowPassModal(true)}
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl font-semibold transition active:scale-[0.98] cursor-pointer text-sm"
              >
                <Lock size={16} /> Change Password
              </button>

              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 p-3 rounded-xl font-semibold transition active:scale-[0.98] cursor-pointer text-sm"
              >
                <LogOut size={16} /> Logout
              </button>

              <button 
                onClick={handleDeleteAccount}
                className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-3 rounded-xl font-semibold transition active:scale-[0.98] cursor-pointer text-sm"
              >
                <Trash2 size={16} /> Delete Account
              </button>

            </div>
          )}

        </div>
      </div>

      {/* TAILWIND POPUP MODAL FOR CHANGE PASSWORD */}
      <AnimatePresence>
        {showPassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100"
            >
              <div className="text-center mb-6">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-3 ${isFarmer ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  <Lock size={22} />
                </div>
                <h3 className="text-xl font-bold text-gray-950">Change Password</h3>
                <p className="text-xs text-gray-400 mt-1">Apna security credentials safely update karein.</p>
              </div>

              <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
                
                {/* Current Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Enter Current Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={passForm.currentPassword}
                      onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full border rounded-xl pl-4 pr-10 py-3 outline-none border-gray-300 focus:border-green-600 text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Enter New Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                      placeholder="Minimum 8 characters"
                      className="w-full border rounded-xl pl-4 pr-10 py-3 outline-none border-gray-300 focus:border-green-600 text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Layout Buttons Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassModal(false);
                      setPassForm({ currentPassword: "", newPassword: "" });
                    }}
                    disabled={passLoading}
                    className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passLoading}
                    className={`py-3 text-white font-semibold rounded-xl text-sm shadow-md transition cursor-pointer ${actionButtonPrimary} disabled:opacity-50`}
                  >
                    {passLoading ? "Verifying..." : "Change Password"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
