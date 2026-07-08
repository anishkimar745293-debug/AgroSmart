import {
  addDoc,
  collection,
  serverTimestamp,
  getDoc,
  getDocs, // 👈 FIX: Manual delete ke liye iski zarurat thi, jo missing tha!
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

/*
------------------------------------
Create Chat Room
------------------------------------
*/
export const createChatRoom = async (farmerId, expertId, requestId) => {
  let farmerName = "Farmer";
  let expertName = "Expert";

  const farmerSnap = await getDoc(doc(db, "farmers", farmerId));
  if (farmerSnap.exists()) {
    const farmer = farmerSnap.data();
    farmerName = farmer.name || farmer.fullName || farmer.username || "Farmer";
  }

  const expertSnap = await getDoc(doc(db, "experts", expertId));
  if (expertSnap.exists()) {
    const expert = expertSnap.data();
    expertName = expert.name || expert.fullName || expert.username || "Expert";
  }

  const chatRef = await addDoc(collection(db, "chats"), {
    farmerId,
    farmerName,
    expertId,
    expertName,
    requestId,
    active: true,
    startedAt: serverTimestamp(),
    endedAt: null,
    deleteAfter: null, // Chat close hone par dynamic time milega
  });

  return chatRef.id;
};

/*
------------------------------------
Send Message
------------------------------------
*/
export const sendMessage = async (chatId, senderId, text = "", images = []) => {
  return addDoc(collection(db, "chats", chatId, "messages"), {
    senderId,
    text,
    images,
    createdAt: serverTimestamp(),
  });
};

/*
------------------------------------
Listen Messages
------------------------------------
*/
export const listenMessages = (chatId, callback) => {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc")
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

/*
------------------------------------
End Chat (Set Expiry Time)
------------------------------------
*/
export const endChat = async (chatId, requestId) => {
  await updateDoc(doc(db, "chats", chatId), {
    active: false,
    endedAt: serverTimestamp(),
    // 5 din ka auto-delete setup (5 days * 24 hours * 60 min * 60 sec * 1000 ms)
    deleteAfter: Date.now() + 5 * 24 * 60 * 60 * 1000, 
  });

  if (requestId) {
    await deleteDoc(doc(db, "consultationRequests", requestId));
  }
};

/*
------------------------------------
Delete Chat From Firebase (Complete Eraser)
------------------------------------
*/
export const deleteChatFromFirebase = async (chatId) => {
  try {
    // 1. Pehle 'messages' sub-collection ke saare docs ko fetch karein
    const messagesRef = collection(db, "chats", chatId, "messages");
    const snapshot = await getDocs(messagesRef);
    
    // 2. Saare messages ko sub-collection se ek-ek karke delete karein
    const deletePromises = snapshot.docs.map((messageDoc) => 
      deleteDoc(doc(db, "chats", chatId, "messages", messageDoc.id))
    );
    await Promise.all(deletePromises);

    // 3. Sub-collection khali hote hi main chat document ko poora delete karein
    await deleteDoc(doc(db, "chats", chatId));
    
    console.log("Chat aur sub-collections database se completely delete ho chuki hain.");
  } catch (error) {
    console.error("Error deleting full chat from Firestore:", error);
    throw error;
  }
};

/*
------------------------------------
Real Auto-Delete Engine 
------------------------------------
*/
// Yeh function dynamically check karega aur agar 5 din bitt chuke hain, 
// toh use backend database se bilkul wipeout (messages + main doc) kar dega.
export const checkAndRunAutoDelete = async (chatsArray) => {
  const now = Date.now();
  
  chatsArray.forEach(async (chat) => {
    if (chat.active === false && chat.deleteAfter && chat.deleteAfter < now) {
      try {
        // Run clean complete delete behind the scenes
        await deleteChatFromFirebase(chat.id);
        console.log(`Auto-Deleted expired Chat Room ID: ${chat.id}`);
      } catch (e) {
        console.error("Auto delete fail for room:", chat.id, e);
      }
    }
  });
};


