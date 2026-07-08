import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { deleteChatFromFirebase } from "../../services/chatService"; 
import DashboardLayout from "../../layouts/DashboardLayout";
import { MessageSquare, ArrowLeft, ArrowRight, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const RecentChatsPage = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const now = Date.now();

    const q = query(
      collection(db, "chats"),
      where("farmerId", "==", currentUser.uid),
      orderBy("startedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedChats = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // 🛑 SAFE AUTODELETE LOGIC: Agar chat active nahi hai aur deleteAfter time cross ho chuka hai (5 din), toh mat dikhao
          if (data.active === false && data.deleteAfter && data.deleteAfter < now) {
            return; 
          }

          fetchedChats.push({
            id: doc.id,
            ...data,
          });
        });
        setChats(fetchedChats);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading recent chats list:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle Manual Delete Click
  const handleDelete = async (e, chatId) => {
    e.stopPropagation(); // Yeh list click item event (navigation) ko rokega
    
    if (window.confirm("Kya aap sach me is chat history ko hamesha ke liye delete karna chahte hain?")) {
      try {
        await deleteChatFromFirebase(chatId);
        toast.success("Chat deleted successfully!");
      } catch (err) {
        toast.error("Delete karne me dikkat aayi.");
      }
    }
  };

  // Date Formatting Helper
  const formatChatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <DashboardLayout role="farmer">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <button 
            onClick={() => navigate("/farmer/dashboard")} 
            className="p-2.5 bg-white hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200/80 transition shadow-sm cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">Your Recent Chats</h1>
            <p className="text-xs text-gray-400 mt-0.5">Purani baatchit yahan hai. Yeh 5 din baad apne aap hat jayegi.</p>
          </div>
        </div>

        {/* Content Panel */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-green-600" size={32} />
            <p className="text-sm text-gray-400 font-medium">Loading your conversations...</p>
          </div>
        ) : chats.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {chats.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => {
                  if (chat.active === false) {
                    navigate(`/chat-history/${chat.id}`);
                  } else {
                    navigate(`/chat/${chat.id}`);
                  }
                }}
                className="p-5 flex items-center justify-between hover:bg-gray-50/40 transition duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold">
                      <MessageSquare size={20} />
                    </div>
                    {chat.active !== false && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                        {chat.expertName || "Expert"}
                      </h3>
                      {chat.active === false ? (
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-md">Closed</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-md animate-pulse">Active</span>
                      )}
                    </div>
                    
                    {/* Date Display */}
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                      Started on: {formatChatDate(chat.startedAt)}
                    </p>
                  </div>
                </div>

                {/* Right Side Control Section (Delete Icon + Arrow) */}
                <div className="flex items-center gap-4 pl-3 shrink-0">
                  <button
                    onClick={(e) => handleDelete(e, chat.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition duration-150 cursor-pointer"
                    title="Delete Chat History"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition">
                    <ArrowRight size={20} />
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3 mt-6">
            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <MessageSquare size={22} />
            </div>
            <h3 className="font-bold text-gray-800 text-base">Koi Chat Nahi Mili</h3>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Aapne abhi tak kisi expert se baatchit nahi ki hai.
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default RecentChatsPage;

