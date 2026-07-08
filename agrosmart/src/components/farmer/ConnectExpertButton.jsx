
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { createConsultationRequest, deleteConsultationRequest } from "../../services/requestService";
import { doc, onSnapshot } from "firebase/firestore";
import RequestTimer from "./RequestTimer";
import { Headphones } from "lucide-react"; // Added Logo icon

const ConnectExpertButton = () => {
    const [loading, setLoading] = useState(false);
    const [requestId, setRequestId] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const navigate = useNavigate();

    const handleConnect = async () => {
        try {
            setLoading(true);
            const user = auth.currentUser;

            const id = await createConsultationRequest(
                user.uid,
                user.displayName || "Farmer"
            );

            setRequestId(id);
            const expiry = Date.now() + 60000;
            setExpiresAt(expiry);

            toast.success("Request sent to experts.");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExpire = async () => {
        if (!requestId) return;
        await deleteConsultationRequest(requestId);
        toast.error("No expert accepted your request.");
        setRequestId(null);
        setExpiresAt(null);
    };

    useEffect(() => {
        if (!requestId) return;

        const unsubscribe = onSnapshot(
            doc(db, "consultationRequests", requestId),
            (snapshot) => {
                if (!snapshot.exists()) return;
                const data = snapshot.data();

                if (data.status === "accepted" && data.chatId) {
                    toast.success("Expert accepted your request.");
                    navigate(`/chat/${data.chatId}`);
                }
            }
        );

        return () => unsubscribe();
    }, [requestId, navigate]);

    return (
        <div className="w-full">
            {!requestId ? (
                <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-md transition active:scale-[0.98] cursor-pointer text-base"
                >
                    <Headphones size={22} className={loading ? "animate-pulse" : ""} />
                    {loading ? "Sending Request..." : "Connect to Expert"}
                </button>
            ) : (
                <RequestTimer
                    expiresAt={expiresAt}
                    onExpire={handleExpire}
                />
            )}
        </div>
    );
};

export default ConnectExpertButton;

