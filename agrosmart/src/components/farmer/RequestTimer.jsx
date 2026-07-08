import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const RequestTimer = ({ expiresAt, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsLeft(diff);

      if (diff <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const min = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const sec = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md w-full">
      <div className="flex items-center gap-3">
        <Loader2 className="animate-spin text-green-400 shrink-0" size={20} />
        <div>
          <h3 className="font-bold text-sm">Waiting for an Expert...</h3>
          <p className="text-xs text-slate-400 mt-0.5">Please wait while an expert accepts your request.</p>
        </div>
      </div>
      <p className="text-3xl font-black font-mono tracking-wider text-green-400 bg-slate-800 px-4 py-1.5 rounded-xl border border-slate-700/50 self-start sm:self-auto">
        {min}:{sec}
      </p>
    </div>
  );
};

export default RequestTimer;


