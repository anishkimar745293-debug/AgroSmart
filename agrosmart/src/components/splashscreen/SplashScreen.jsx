import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import plantImg from "../../assets/logo/icon1.png";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login"); // Change route if needed
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-100 flex flex-col items-center justify-center overflow-hidden relative">

      {/* Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-green-200 rounded-full blur-[150px] opacity-30"></div>

      {/* Animation Area */}
      <div className="relative w-[350px] h-[350px] flex items-center justify-center">

        {/* Seed */}
        <div className="seed"></div>

        {/* Plant */}
        <img
          src={plantImg}
          alt="Plant"
          className="plant-image"
        />
      </div>

      {/* Logo */}
      <h1 className="logo">
        <span className="text-green-600">Agro</span>
        <span className="text-gray-900">Smart AI</span>
      </h1>

      {/* Divider */}
      <div className="divider">
        <span></span>
        🌱
        <span></span>
      </div>

      {/* Slogan */}
      <p className="slogan">
        Smart Farming. Better Decisions. Higher Yields.
        <br />
        Empowering Farmers with AI Technology.
      </p>

      <style>{`
        /* ==========================
           SEED FALL ANIMATION
        ========================== */

        .seed {
          position: absolute;

          width: 22px;
          height: 30px;

          left: 50%;
          transform: translateX(-50%);

          background: linear-gradient(
            135deg,
            #8b5a2b,
            #5a3414
          );

          border-radius: 50%;

          top: -120px;

          z-index: 20;

          animation:
            seedDrop 1.8s ease-in forwards,
            seedHide 0.3s linear 2s forwards;
        }

        @keyframes seedDrop {
          0% {
            top: -120px;
          }

          80% {
            top: 220px;
          }

          90% {
            top: 205px;
          }

          100% {
            top: 220px;
          }
        }

        @keyframes seedHide {
          to {
            opacity: 0;
            transform: translateX(-50%) scale(0);
          }
        }

        /* ==========================
           PLANT GROW ANIMATION
        ========================== */

        .plant-image {
          position: absolute;

          bottom: 0;

          width: 220px;

          opacity: 0;

          transform: scaleY(0);

          transform-origin: bottom center;

          animation: growPlant 1.5s ease-out 2s forwards;
        }

        @keyframes growPlant {
          0% {
            opacity: 0;
            transform: scaleY(0);
          }

          30% {
            opacity: 1;
            transform: scaleY(0.3);
          }

          60% {
            opacity: 1;
            transform: scaleY(0.7);
          }

          100% {
            opacity: 1;
            transform: scaleY(1);
          }
        }

        /* ==========================
           LOGO
        ========================== */

        .logo {
          margin-top: 30px;

          font-size: 4rem;
          font-weight: 800;

          opacity: 0;

          animation: fadeUp 1s ease-out 3.8s forwards;
        }

        /* ==========================
           DIVIDER
        ========================== */

        .divider {
          display: flex;
          align-items: center;
          gap: 15px;

          margin-top: 10px;

          opacity: 0;

          animation: fadeUp 1s ease-out 4.1s forwards;
        }

        .divider span {
          width: 70px;
          height: 2px;
          background: #16a34a;
        }

        /* ==========================
           SLOGAN
        ========================== */

        .slogan {
          margin-top: 20px;

          font-size: 1.25rem;

          text-align: center;

          color: #4b5563;

          line-height: 1.8;

          opacity: 0;

          animation: fadeUp 1s ease-out 4.5s forwards;
        }

        /* ==========================
           FADE UP
        ========================== */

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ==========================
           MOBILE
        ========================== */

        @media (max-width: 768px) {
          .plant-image {
            width: 170px;
          }

          .logo {
            font-size: 2.8rem;
          }

          .slogan {
            font-size: 1rem;
            padding: 0 20px;
          }

          .divider span {
            width: 50px;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;