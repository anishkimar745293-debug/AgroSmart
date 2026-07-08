import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PhoneOff } from "lucide-react";
import { getCall, endCall, listenCall } from "../../services/callService";
import { getLocalStream, attachRemoteStream, cleanupWebRTC } from "../../services/webrtcService";

const VideoCall = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const [call, setCall] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Load Call and Setup Streams
  useEffect(() => {
    const loadCall = async () => {
      const data = await getCall(callId);
      setCall(data);

      // 1. Apni local screen video element par attach karein
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = getLocalStream();
      }

      // 2. Peer connection se remote user ki stream incoming hote hi dusre element par bind karein
      if (remoteVideoRef.current) {
        attachRemoteStream(remoteVideoRef.current);
      }
    };

    loadCall();
  }, [callId]);

  // Listen Call End by other user
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
    <div className="h-screen bg-gray-900 relative flex flex-col justify-between overflow-hidden">
      {/* REMOTE VIDEO (Badi Screen Par) */}
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* LOCAL VIDEO (Choti floating screen corner me) */}
      <div className="absolute top-4 right-4 w-32 h-48 bg-gray-800 rounded-xl overflow-hidden border-2 border-white shadow-lg z-10">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted // Apni aawaz khudko echo na kare isliye muted
          className="w-full h-full object-cover transform -scale-x-100"
        />
      </div>

      {/* Call Controls Overlay Panel */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
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

export default VideoCall;

