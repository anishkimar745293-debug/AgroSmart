

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Profile from "../components/profile/Profile";
import MainLayout from "../layouts/MainLayout";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";

import FarmerDashboard from "../pages/farmer/FarmerDashboard";
import ExpertDashboard from "../pages/expert/ExpertDashboard";
import RecentChatsPage from "../pages/farmer/RecentChatsPage";
import ChatHistoryPage from "../pages/farmer/ChatHistoryPage";
import CropAdvisoryPage from "../pages/farmer/CropAdvisoryPage";
import DiseaseLab from "../pages/farmer/DiseaseLab";
import ChatPage from "../pages/chat/ChatPage";
import SplashScreen from "../components/splashscreen/SplashScreen";

import OutgoingCall from "../pages/call/OutgoingCall";
import IncomingCall from "../pages/call/IncomingCall";
import VoiceCall from "../pages/call/VoiceCall";
import VideoCall from "../pages/call/VideoCall";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "../pages/error/NotFound";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Sabse pehle user jab website kholega, use Splash Screen dikhegi */}
        <Route path="/" element={<SplashScreen />} />

        {/* Public Pages */}
        <Route element={<MainLayout />}>
          {/* Splash screen 6 second baad is /login par navigate karegi */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Protected Farmer */}
        <Route
          path="/farmer/dashboard"
          element={
            <ProtectedRoute>
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Expert */}
        <Route
          path="/expert/dashboard"
          element={
            <ProtectedRoute>
              <ExpertDashboard />
            </ProtectedRoute>
          }
        />

        {/* Chat */}
        <Route
          path="/chat/:chatId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Calling */}
        <Route
          path="/call/outgoing/:callId"
          element={
            <ProtectedRoute>
              <OutgoingCall />
            </ProtectedRoute>
          }
        />

        <Route
          path="/call/incoming/:callId"
          element={
            <ProtectedRoute>
              <IncomingCall />
            </ProtectedRoute>
          }
        />

        <Route
          path="/call/voice/:callId"
          element={
            <ProtectedRoute>
              <VoiceCall />
            </ProtectedRoute>
          }
        />

        <Route
          path="/call/video/:callId"
          element={
            <ProtectedRoute>
              <VideoCall />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="/recent-chats" element={<RecentChatsPage />} />
        <Route path="/chat-history/:chatId" element={<ChatHistoryPage />} />
        <Route path="/farmer/crop-advisory" element={<CropAdvisoryPage />} />
        <Route path="/farmer/disease-lab" element={<DiseaseLab />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
