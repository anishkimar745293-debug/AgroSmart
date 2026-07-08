

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase";

import { db } from "../firebase/firebase";


/*
------------------------------------
Create Chat Room
------------------------------------
*/

export const createChatRoom = async (
  farmerId,
  expertId,
  requestId
) => {

  const ref = await addDoc(
    collection(db, "chats"),
    {
      farmerId,
      expertId,
      requestId,
      active: true,
      startedAt: serverTimestamp(),
    }
  );

  return ref.id;
};

/*
------------------------------------
Send Message
------------------------------------
*/

export const sendMessage = async (
  chatId,
  senderId,
  text
) => {

  return addDoc(
    collection(db, "chats", chatId, "messages"),
    {
      senderId,
      text,
      createdAt: serverTimestamp(),
    }
  );

};

/*
------------------------------------
Listen Messages
------------------------------------
*/

export const listenMessages = (
  chatId,
  callback
) => {

  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt")
  );

  return onSnapshot(q, (snapshot) => {

    const messages = [];

    snapshot.forEach((doc) => {

      messages.push({
        id: doc.id,
        ...doc.data(),
      });

    });

    callback(messages);

  });

};

export const resetPassword = async (email) => {

  await sendPasswordResetEmail(auth, email);

  return {
    success: true,
    message: "Password reset email sent successfully.",
  };

};
