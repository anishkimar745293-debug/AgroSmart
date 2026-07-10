import LogoWhite from "../common/LogoWhite";
import { CheckCircle, Video, MessageCircle, Sprout } from "lucide-react";

const WelcomePanel = () => {
  return (
    // Yahan w-1/2 ko w-full kiya hai kyunki parent outer container width control kar raha hai
    <div className="hidden lg:flex flex-col justify-between bg-green-700 text-white p-10 w-full h-full rounded-l-3xl">
      <div>
        <LogoWhite />
        <h2 className="text-5xl font-extrabold leading-tight mt-6">
          Welcome to AgroSmart
        </h2>
        <p className="mt-6 text-xl leading-10 text-green-100">
          Connect Farmers with Agriculture Experts through
          secure chat, voice call and video consultation.
        </p>
      </div>

      <div className="space-y-3">
        <p>✔ Real-time Expert Consultation</p>
        <p>✔ Secure Messaging</p>
        <p>✔ HD Video Calling</p>
        <p>✔ AI Powered Agriculture</p>
      </div>
    </div>
  );
};

export default WelcomePanel;
