import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

import {
  acceptRequest,
  rejectRequest,
  listenConsultationRequests,
} from "../../services/requestService";

const IncomingRequests = () => {
  const [requests, setRequests] = useState([]);

  const expertId = auth.currentUser?.uid;

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe =
      listenConsultationRequests(setRequests);

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="text-2xl font-bold mb-6">
        Incoming Requests
      </h2>

      {requests.length === 0 ? (

        <p className="text-gray-500">
          No consultation requests.
        </p>

      ) : (

        requests.map((request) => (

          <div
            key={request.id}
            className="border rounded-xl p-4 mb-4"
          >

            <h3 className="font-bold text-lg">
              {request.farmerName}
            </h3>

            <p className="text-gray-500 mt-1">
              Status : {request.status}
            </p>

            <div className="flex gap-3 mt-5">




              <button
                onClick={async () => {

                  const chatId =
                    await acceptRequest(request);

                  navigate(`/chat/${chatId}`);

                }}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Accept
              </button>




              {/* <button
                onClick={() =>
                  acceptRequest(
                    request.id,
                    expertId
                  )
                }
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
              >
                Accept
              </button> */}

              <button
                onClick={() =>
                  rejectRequest(
                    request.id,
                    expertId
                  )
                }
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
              >
                Reject
              </button>

            </div>

          </div>

        ))

      )}

    </div>
  );
};

export default IncomingRequests;