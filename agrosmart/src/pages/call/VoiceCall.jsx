import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PhoneOff, Mic } from "lucide-react";
import { getCall, endCall, listenCall } from "../../services/callService";
import { attachRemoteStream, cleanupWebRTC } from "../../services/webrtcService";

const VoiceCall = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const [call, setCall] = useState(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    const loadCall = async () => {
      const data = await getCall(callId);
      setCall(data);

      // Background audio router setup
      if (remoteAudioRef.current) {
        attachRemoteStream(remoteAudioRef.current);
      }
    };

    loadCall();
  }, [callId]);

  // Listen disconnect
  useEffect(() => {
    const unsubscribe = listenCall(callId, (data) => {
      if (data.status === "ended") {
        cleanupWebRTC();
        navigate(`/chat/${data.chatId}`);
      }
    });
    return () => unsubscribe();
  }, [callId, navigate]);

  const handleLeave = async () => {
    await endCall(callId);
    cleanupWebRTC();
    if (call) navigate(`/chat/${call.chatId}`);
  };

  if (!call) return null;

  return (
    <div className="h-screen bg-green-800 flex flex-col items-center justify-center text-white relative">
      {/* Hidden audio element jo incoming sound pipe karega */}
      <audio ref={remoteAudioRef} autoPlay />

      <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 animate-pulse">
        <Mic size={55} className="text-white" />
      </div>

      <h1 className="text-2xl font-bold mt-8">Voice Call Active</h1>
      <p className="opacity-70 mt-2">Connecting secure speech channel...</p>

      <div className="absolute bottom-12">
        <button
          onClick={handleLeave}
          className="p-4 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-xl transition transform hover:scale-110"
        >
          <PhoneOff size={28} />
        </button>
      </div>
    </div>
  );
};

export default VoiceCall;

