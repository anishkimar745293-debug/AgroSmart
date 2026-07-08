import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

import { createChatRoom } from "./chatService";

export const createConsultationRequest = async (
  farmerId,
  farmerName
) => {
  const expiresAt = Date.now() + 60000; // 60 seconds

  const docRef = await addDoc(
    collection(db, "consultationRequests"),
    {
      farmerId,
      farmerName,

      status: "waiting",

      acceptedBy: null,

      createdAt: serverTimestamp(),

      expiresAt,
    }
  );

  return docRef.id;
};



export const listenConsultationRequests = (callback) => {

  const q = query(
    collection(db, "consultationRequests"),
    where("status", "==", "waiting")
  );

  return onSnapshot(q, (snapshot) => {

    const requests = [];

    snapshot.forEach((doc) => {

      requests.push({
        id: doc.id,
        ...doc.data(),
      });

    });

    callback(requests);

  });

};

/*
---------------------------------------
Reject Request
---------------------------------------
*/

export const rejectRequest = async (
  requestId,
  expertId
) => {

  await setDoc(
    doc(
      db,
      "requestResponses",
      `${requestId}_${expertId}`
    ),
    {
      requestId,
      expertId,
      response: "rejected",
    }
  );

};


/*
---------------------------------------
Accept Request
---------------------------------------
*/


export const acceptRequest = async (
  request
) => {

  const expertId = auth.currentUser.uid;

  // Create Chat

  const chatId = await createChatRoom(
    request.farmerId,
    expertId,
    request.id
  );

  // Update Request

  await updateDoc(
    doc(
      db,
      "consultationRequests",
      request.id
    ),
    {
      status: "accepted",

      acceptedBy: expertId,

      chatId,
    }
  );



  return chatId;

};


/*
---------------------------------------
Expire Consultation Request
---------------------------------------
*/

export const expireRequest = async (requestId) => {
  await updateDoc(
    doc(db, "consultationRequests", requestId),
    {
      status: "expired",
    }
  );
};


/*
---------------------------------------
Delete Consultation Request
---------------------------------------
*/

export const deleteConsultationRequest = async (
  requestId
) => {

  await deleteDoc(
    doc(
      db,
      "consultationRequests",
      requestId
    )
  );

};