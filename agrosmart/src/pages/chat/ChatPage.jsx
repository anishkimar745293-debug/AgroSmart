import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { uploadImage } from "../../services/cloudinaryService";
import { auth, db } from "../../firebase/firebase";
import IncomingCall from "../call/IncomingCall"; 


import {
  Phone,
  Video,
  Image,
  Send,
  LogOut,
} from "lucide-react";

import {
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

import {
  sendMessage,
  listenMessages,
  endChat,
} from "../../services/chatService";

import {
  createCall,
  listenIncomingCalls,
} from "../../services/callService";

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const bottomRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]);
  
  // Incoming Call State
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    const loadChat = async () => {
      const snap = await getDoc(doc(db, "chats", chatId));
      if (snap.exists()) {
        setChat(snap.data());
      }
    };
    loadChat();
  }, [chatId]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "chats", chatId),
      (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        setChat(data);

        if (data.active === false) {
          toast.success("Chat Ended", { position: "bottom-center", duration: 2000 });
          setTimeout(() => {
            if (currentUser.uid === data.farmerId) {
              navigate("/farmer/dashboard");
            } else {
              navigate("/expert/dashboard");
            }
          }, 2000);
        }
      }
    );
    return () => unsubscribe();
  }, [chatId, currentUser, navigate]);

  useEffect(() => {
    const unsubscribe = listenMessages(chatId, setMessages);
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  /*
  ==============================================================
  CRITICAL: FIRMWARE CALL DETECTOR WITH NETWORK FAILSAFE
  ==============================================================
  */
  useEffect(() => {
    if (!currentUser?.uid) return;

    console.log("Listening for incoming calls for user UID:", currentUser.uid);

    const unsubscribe = listenIncomingCalls(
      currentUser.uid,
      (calls) => {
        console.log("Firestore Se Incoming Calls Mili: ", calls);
        
        if (!calls || calls.length === 0) {
          setIncomingCall(null);
          return;
        }

        // Check karein ki status 'ringing' hai aur caller khud hum nahi hain
        const activeRingingCall = calls.find(
          c => c.status === "ringing" && c.callerId !== currentUser.uid
        );

        if (activeRingingCall) {
          console.log("Setting active incoming call screen for ID:", activeRingingCall.id);
          setIncomingCall(activeRingingCall);
        } else {
          setIncomingCall(null);
        }
      }
    );
    
    return () => unsubscribe();
  }, [currentUser]);

  const handleSend = async () => {
    if (!chat?.active) return;
    if (!message.trim() && selectedImages.length === 0) return;

    let imageUrls = [];
    for (const file of selectedImages) {
      const url = await uploadImage(file);
      imageUrls.push(url);
    }

    await sendMessage(chatId, currentUser.uid, message, imageUrls);
    setMessage("");
    setSelectedImages([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleEndChat = async () => {
    await endChat(chatId, chat.requestId);
  };

  const handleCall = async (type) => {
    if (!chat?.active) return;
    const receiverId = currentUser.uid === chat.farmerId ? chat.expertId : chat.farmerId;
    const callId = await createCall(chatId, currentUser.uid, receiverId, type);
    navigate(`/call/outgoing/${callId}`);
  };

  const otherPerson = currentUser?.uid === chat?.farmerId ? chat?.expertName : chat?.farmerName;

  return (
    <div className="h-screen bg-gray-100 flex flex-col relative overflow-hidden">
      
      {/* FULL SCREEN OVERLAY FOR INCOMING CALL */}
      {incomingCall && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-green-800">
          <IncomingCall call={incomingCall} />
        </div>
      )}

      {/* Main UI layout */}
      <div className="bg-green-700 text-white px-6 py-4 flex items-center justify-between shadow z-10">
        <div>
          <h2 className="text-xl font-bold">{otherPerson || "Loading..."}</h2>
          <p className="text-sm opacity-80">Consultation Chat</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => handleCall("voice")} className="hover:bg-green-800 p-2 rounded-full">
            <Phone size={22} />
          </button>
          <button onClick={() => handleCall("video")} className="hover:bg-green-800 p-2 rounded-full">
            <Video size={22} />
          </button>
          <button onClick={handleEndChat} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2">
            <LogOut size={18} />
            End Chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.senderId === currentUser.uid ? "flex justify-end" : "flex justify-start"}>
            <div className={msg.senderId === currentUser.uid ? "bg-green-600 text-white px-4 py-3 rounded-2xl max-w-md" : "bg-white shadow px-4 py-3 rounded-2xl max-w-md"}>
              {msg.images?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {msg.images.map((img, index) => (
                    <img key={index} src={img} alt="" className="w-40 rounded-xl cursor-pointer" />
                  ))}
                </div>
              )}
              {msg.text && <p className="break-words">{msg.text}</p>}
              <p className={`text-xs mt-2 ${msg.senderId === currentUser.uid ? "text-green-100" : "text-gray-500"}`}>
                {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div className="bg-white border-t p-4">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer text-gray-600 hover:text-green-600">
            <Image size={24} />
            <input
              type="file" accept="image/*" multiple hidden
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setSelectedImages((prev) => [...prev, ...files]);
                e.target.value = "";
              }}
            />
          </label>
          <input
            type="text" value={message} disabled={!chat?.active}
            onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={chat?.active ? "Type your message..." : "Chat Ended"}
            className="flex-1 border rounded-full px-5 py-3 outline-none focus:border-green-500 disabled:bg-gray-100"
          />
          <button disabled={!chat?.active} onClick={handleSend} className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3 disabled:opacity-40">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

