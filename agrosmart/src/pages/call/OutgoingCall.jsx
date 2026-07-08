import { useEffect, useState } from "react";
import { PhoneOff } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import CallLoader from "../../components/call/CallLoader";
import { deleteCall, listenCall, addIceCandidate, listenIceCandidates } from "../../services/callService";
import {
  createPeerConnection,
  startLocalStream,
  addLocalTracks,
  createOffer,
  setRemoteAnswer,
} from "../../services/webrtcService";

const OutgoingCall = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const [call, setCall] = useState(null);
  const [receiverName, setReceiverName] = useState("User");
  const [status, setStatus] = useState("Calling...");

  useEffect(() => {
    let unsubscribeCandidates = null;

    const initializeCall = async () => {
      try {
        // 1. Fetch details to check if video or audio only
        const currentCallSnap = await getDoc(doc(db, "calls", callId));
        const isVideo = currentCallSnap.exists() && currentCallSnap.data().type === "video";

        // 2. Initialize connection & local tracks
        createPeerConnection();
        await startLocalStream(isVideo);
        addLocalTracks();

        // 3. Collect local ICE candidates and write to "callerCandidates" subcollection
        // Assign the native onicecandidate listener manually
        window.peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            addIceCandidate(callId, "callerCandidates", event.candidate.toJSON());
          }
        };

        // 4. Create offer and save to the Firestore root call document
        await createOffer(callId);

        // 5. Start listening to candidates coming from the target user ("calleeCandidates")
        unsubscribeCandidates = listenIceCandidates(callId, "calleeCandidates", async (candidateData) => {
          if (window.peerConnection && candidateData) {
            await window.peerConnection.addIceCandidate(new RTCIceCandidate(candidateData));
          }
        });

      } catch (err) {
        console.error("WebRTC Handshake Init Error:", err);
      }
    };

    initializeCall();

    return () => {
      if (unsubscribeCandidates) unsubscribeCandidates();
    };
  }, [callId]);

  useEffect(() => {
    const unsubscribe = listenCall(callId, async (data) => {
      setCall(data);
      switch (data.status) {
        case "ringing":
          setStatus("Calling...");
          break;
        case "accepted":
          setStatus("Connecting...");
          if (data.answer) {
            // 6. Provide the remote side's SDP Answer back to our local connection engine
            await setRemoteAnswer(data.answer);
            if (data.type === "voice") {
              navigate(`/call/voice/${callId}`);
            } else {
              navigate(`/call/video/${callId}`);
            }
          }
          break;
        case "rejected":
          setStatus("Call Declined");
          setTimeout(() => navigate(`/chat/${data.chatId}`), 1500);
          break;
        case "ended":
          setStatus("Call Ended");
          setTimeout(() => navigate(`/chat/${data.chatId}`), 1500);
          break;
        default:
          break;
      }
    });

    return () => unsubscribe();
  }, [callId, navigate]);

  const handleCancel = async () => {
    await deleteCall(callId);
    if (call) navigate(`/chat/${call.chatId}`);
  };

  return (
    <div className="h-screen bg-green-700 text-white flex flex-col items-center justify-center">
      <div className="w-36 h-36 rounded-full bg-white text-green-700 flex items-center justify-center text-5xl font-bold">
        {receiverName.charAt(0).toUpperCase()}
      </div>
      <h1 className="text-3xl font-bold mt-8">{status}</h1>
      <h2 className="text-xl mt-3">{receiverName}</h2>
      <div className="mt-10">
        <CallLoader />
      </div>
      <button onClick={handleCancel} className="mt-12 p-4 bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition">
        <PhoneOff size={28} />
      </button>
    </div>
  );
};

export default OutgoingCall;

