import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

/*
=========================================
Create Call
=========================================
*/

export const createCall = async (
  chatId,
  callerId,
  receiverId,
  type
) => {

  const ref = await addDoc(
    collection(db, "calls"),
    {
      chatId,
      callerId,
      receiverId,
      type,
      status: "ringing",
      connectionState: "new",
      offer: null,
      answer: null,
      startedAt: null,
      endedAt: null,
      createdAt: serverTimestamp(),
    }
  );

  return ref.id;

};

/*
=========================================
Get Call
=========================================
*/

export const getCall = async (callId) => {

  const snap = await getDoc(
    doc(db, "calls", callId)
  );

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };

};

/*
=========================================
Listen Call
=========================================
*/

export const listenCall = (
  callId,
  callback
) => {

  return onSnapshot(
    doc(db, "calls", callId),
    (snapshot) => {

      if (!snapshot.exists()) return;

      callback({
        id: snapshot.id,
        ...snapshot.data(),
      });

    }
  );

};

/*
=========================================
Incoming Calls
=========================================
*/

export const listenIncomingCalls = (
  userId,
  callback
) => {

  const q = query(
    collection(db, "calls"),
    where("receiverId", "==", userId),
    where("status", "==", "ringing")
  );

  return onSnapshot(q, (snapshot) => {

    const calls = [];

    snapshot.forEach((doc) => {

      calls.push({
        id: doc.id,
        ...doc.data(),
      });

    });

    callback(calls);

  });

};

/*
=========================================
Accept Call
=========================================
*/

export const acceptCall = async (
  callId
) => {

  await updateDoc(
    doc(db, "calls", callId),
    {
      status: "accepted",
      startedAt: serverTimestamp(),
    }
  );

};

/*
=========================================
Reject Call
=========================================
*/

export const rejectCall = async (
  callId
) => {

  await updateDoc(
    doc(db, "calls", callId),
    {
      status: "rejected",
      endedAt: serverTimestamp(),
    }
  );

};

/*
=========================================
End Call
=========================================
*/

export const endCall = async (
  callId
) => {

  await updateDoc(
    doc(db, "calls", callId),
    {
      status: "ended",
      endedAt: serverTimestamp(),
    }
  );

};

/*
=========================================
Delete Call
=========================================
*/

export const deleteCall = async (
  callId
) => {

  await deleteDoc(
    doc(db, "calls", callId)
  );

};

/*
=========================================
Update Call
=========================================
*/

export const updateCall = async (
  callId,
  data
) => {

  await updateDoc(
    doc(db, "calls", callId),
    data
  );

};

/*
=========================================
Save Offer
=========================================
*/

export const saveOffer = async (
  callId,
  offer
) => {

  await updateDoc(
    doc(db, "calls", callId),
    {
      offer,
    }
  );

};

/*
=========================================
Save Answer
=========================================
*/

export const saveAnswer = async (
  callId,
  answer
) => {

  await updateDoc(
    doc(db, "calls", callId),
    {
      answer,
    }
  );

};

/*
=========================================
Add ICE Candidate
=========================================
*/

export const addIceCandidate = async (
  callId,
  type,
  candidate
) => {

  const candidateRef = doc(
    collection(
      db,
      "calls",
      callId,
      type
    )
  );

  await setDoc(
    candidateRef,
    candidate
  );

};

/*
=========================================
Listen ICE Candidates
=========================================
*/

export const listenIceCandidates = (
  callId,
  type,
  callback
) => {

  return onSnapshot(

    collection(
      db,
      "calls",
      callId,
      type
    ),

    (snapshot) => {

      snapshot.docChanges().forEach(
        (change) => {

          if (
            change.type === "added"
          ) {

            callback(
              change.doc.data()
            );

          }

        }
      );

    }

  );

};

/*
=========================================
Delete Candidate Collection
=========================================
*/

export const clearCandidates = async (
  callId
) => {

  // We will implement cleanup later.

};

/*
=========================================
Call Exists
=========================================
*/

export const callExists = async (
  callId
) => {

  const snap = await getDoc(
    doc(db, "calls", callId)
  );

  return snap.exists();

};

