import React from "react";

const IncomingCallModal = ({
  call,
  onAccept,
  onReject,
}) => {

  if (!call) return null;

  return (

    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl p-8 w-96">

        <h2 className="text-2xl font-bold text-center">

          Incoming {call.type} Call

        </h2>

        <p className="text-center mt-4 text-gray-600">

          Someone is calling you...

        </p>

        <div className="flex gap-4 mt-8">

          <button
            onClick={onReject}
            className="flex-1 bg-red-600 text-white py-3 rounded-xl"
          >
            Reject
          </button>

          <button
            onClick={onAccept}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl"
          >
            Accept
          </button>

        </div>

      </div>

    </div>

  );

};

export default IncomingCallModal;