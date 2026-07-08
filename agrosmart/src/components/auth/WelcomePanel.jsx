// import Logo from "../common/Logo";
import LogoWhite from "../common/LogoWhite";
// import banner from "../../assets/images/login-banner.png";
import {
  CheckCircle,
  Video,
  MessageCircle,
  Sprout,
} from "lucide-react";

const WelcomePanel = () => {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-green-700 text-white p-10 w-1/2 rounded-l-3xl">

      <div>
        {/* <Logo /> */}
        <LogoWhite />

        {/* <h2 className="text-4xl font-bold mt-10"> */}
        <h2 className="text-5xl font-extrabold leading-tight">
          Welcome to AgroSmart
        </h2>

        {/* <p className="mt-5 text-green-100 leading-8"> */}
        <p className="mt-6 text-xl leading-10 text-green-100">
          Connect Farmers with Agriculture Experts through
          secure chat, voice call and video consultation.
        </p>
      </div>

      {/* <img
        src={banner}
        alt="AgroSmart"
        // className="w-full object-contain"
        className="w-full h-72 object-cover rounded-2xl"
      /> */}

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