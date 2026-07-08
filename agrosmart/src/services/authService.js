import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

/*
---------------------------------------
Check Phone Number Exists
---------------------------------------
*/

export const phoneExists = async (collectionName, phone) => {
  const q = query(
    collection(db, collectionName),
    where("phone", "==", phone)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
};

/*
---------------------------------------
Check User ID Exists
---------------------------------------
*/

export const userIdExists = async (collectionName, userId) => {
  const q = query(
    collection(db, collectionName),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
};

/*
---------------------------------------
Register User
---------------------------------------
*/

export const registerUser = async (
  role,
  formData
) => {

  const collectionName =
    role === "farmer"
      ? "farmers"
      : "experts";

  /*
      Check Phone
  */

  if (
    await phoneExists(
      collectionName,
      formData.phone
    )
  ) {
    throw new Error(
      "Phone Number already registered."
    );
  }

  /*
      Check User ID
  */

  if (
    await userIdExists(
      collectionName,
      formData.userId
    )
  ) {
    throw new Error(
      "User ID already exists."
    );
  }

  /*
      Firebase Authentication
  */

  const credential =
    await createUserWithEmailAndPassword(

      auth,

      formData.email,

      formData.password

    );

  /*
      Verification Email
  */

  await sendEmailVerification(
    credential.user
  );

  /*
      Firestore
  */

  await setDoc(

    doc(
      db,
      collectionName,
      credential.user.uid
    ),

    {
      uid: credential.user.uid,

      role,

      name: formData.name,

      email: formData.email,

      phone: formData.phone,

      userId: formData.userId,

      address: formData.address,

      profilePhoto: "",

      createdAt: Date.now(),
    }

  );

  return credential.user;

};