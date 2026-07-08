import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { listenMessages } from "../../services/chatService";
import DashboardLayout from "../../layouts/DashboardLayout";
import { ArrowLeft, MessageSquare, ShieldAlert } from "lucide-react";

const ChatHistoryPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const loadChat = async () => {
      try {
        const snap = await getDoc(doc(db, "chats", chatId));
        if (snap.exists()) {
          setChat(snap.data());
        }
      } catch (error) {
        console.error("Error loading chat details:", error);
      }
    };
    loadChat();
  }, [chatId]);

  useEffect(() => {
    const unsubscribe = listenMessages(chatId, setMessages);
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const otherPerson = currentUser?.uid === chat?.farmerId ? chat?.expertName : chat?.farmerName;

  return (
    <DashboardLayout role="farmer">
      <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center gap-4 shadow-sm shrink-0">
          <button 
            onClick={() => navigate("/recent-chats")} 
            className="p-2 hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold">{otherPerson || "Loading..."}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <ShieldAlert size={12} className="text-amber-500" /> Read-Only History
            </p>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={msg.senderId === currentUser?.uid ? "flex justify-end" : "flex justify-start"}
            >
              <div className={msg.senderId === currentUser?.uid ? "bg-green-600 text-white px-4 py-3 rounded-2xl max-w-md shadow-sm" : "bg-white border border-gray-100 text-gray-800 shadow-sm px-4 py-3 rounded-2xl max-w-md"}>
                {msg.images?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.images.map((img, index) => (
                      <img key={index} src={img} alt="" className="w-40 rounded-xl object-cover" />
                    ))}
                  </div>
                )}
                {msg.text && <p className="break-words text-sm font-medium leading-relaxed">{msg.text}</p>}
                <p className={`text-[10px] mt-2 font-mono ${msg.senderId === currentUser?.uid ? "text-green-100/80" : "text-gray-400"}`}>
                  {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef}></div>
        </div>

        {/* Locked Footer Status */}
        <div className="bg-amber-50 border-t border-amber-100 px-6 py-4 text-center shrink-0">
          <p className="text-xs font-bold text-amber-800 tracking-wide flex items-center justify-center gap-1.5">
            <ShieldAlert size={15} />
            Yeh chat band ho chuki hai. Aap isme naye messages nahi bhej sakte.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ChatHistoryPage;