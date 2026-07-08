import { useEffect, useState } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../firebase/firebase";
import {
  acceptCall,
  rejectCall,
  addIceCandidate,
  listenIceCandidates,
} from "../../services/callService";

import {
  createPeerConnection,
  startLocalStream,
  addLocalTracks,
  createAnswer,
} from "../../services/webrtcService";

const IncomingCall = ({ call }) => {
  const navigate = useNavigate();
  const [callerName, setCallerName] = useState("User");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!call) return;
    const loadCaller = async () => {
      let snap = await getDoc(doc(db, "farmers", call.callerId));
      if (!snap.exists()) {
        snap = await getDoc(doc(db, "experts", call.callerId));
      }
      if (snap.exists()) {
        setCallerName(snap.data().name);
      }
    };
    loadCaller();
  }, [call]);

  const handleAccept = async () => {
    if (!call) return;
    setLoading(true);

    try {
      console.log("Accepting call for ID:", call.id);

      // 1. Sabse pehle local WebRTC Peer Connection object ready karein
      const pc = createPeerConnection();

      // 2. Browser se Audio/Video Camera permission lein
      const isVideo = call.type === "video";
      await startLocalStream(isVideo);
      
      // 3. Apne tracks ko peer connection me add karein
      addLocalTracks();

      // 4. Local ICE candidates ko handle karne ke liye listener lagayein
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Callee ICE candidate generated");
          addIceCandidate(call.id, "calleeCandidates", event.candidate.toJSON());
        }
      };

      // 5. Firestore se Caller ka bheja hua baseline Offer fetch karein
      const callSnap = await getDoc(doc(db, "calls", call.id));
      const offerSDP = callSnap.data().offer;

      if (!offerSDP) {
        throw new Error("Caller ka WebRTC Offer abhi firestore me upload nahi hua hai!");
      }

      // 6. Offer ko handle karke dynamic Answer SDP create karein aur save karein
      await createAnswer(call.id, offerSDP);

      // 7. Caller ke bheje ja rahe ICE candidates ko listen karna shuru karein
      listenIceCandidates(call.id, "callerCandidates", async (candidateData) => {
        if (pc && candidateData) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidateData));
            console.log("Caller ICE Candidate successfully added to Callee Connection");
          } catch (e) {
            console.error("Error adding caller candidate:", e);
          }
        }
      });

      // 8. Firestore me call status ko 'accepted' mark karein
      await acceptCall(call.id);
      console.log("Call state set to accepted successfully");

      // 9. Actual screen par user ko redirect karein
      if (call.type === "voice") {
        navigate(`/call/voice/${call.id}`);
      } else {
        navigate(`/call/video/${call.id}`);
      }
    } catch (err) {
      console.error("Detailed Error inside handleAccept:", err);
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!call) return;
    await rejectCall(call.id);
  };

  if (!call) return null;

  return (
    <div className="fixed inset-0 bg-green-700 z-[9999] flex flex-col items-center justify-center text-white">
      <div className="w-36 h-36 rounded-full bg-white text-green-700 text-5xl font-bold flex items-center justify-center shadow-xl">
        {callerName.charAt(0).toUpperCase()}
      </div>
      <h1 className="text-3xl font-bold mt-8">Incoming Call</h1>
      <h2 className="text-xl mt-4">{callerName}</h2>
      
      <div className="mt-6">
        {call.type === "video" ? <Video size={55} /> : <Phone size={55} />}
      </div>

      {loading && <p className="mt-5 text-lg animate-pulse">Connecting Streams...</p>}

      <div className="flex gap-12 mt-16">
        <button
          onClick={handleReject}
          className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition shadow-lg"
        >
          <PhoneOff size={32} />
        </button>
        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition shadow-lg disabled:opacity-50"
        >
          <Phone size={32} />
        </button>
      </div>
    </div>
  );
};

export default IncomingCall;

