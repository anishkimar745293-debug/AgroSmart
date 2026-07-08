import {
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

import {
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

/*
-------------------------------------
Find Email using Phone or User ID
-------------------------------------
*/

const findEmail = async (input) => {

    // Search Farmers

    let q = query(
        collection(db, "farmers"),
        where("phone", "==", input)
    );

    let snapshot = await getDocs(q);

    if (!snapshot.empty) {
        return snapshot.docs[0].data().email;
    }

    q = query(
        collection(db, "farmers"),
        where("userId", "==", input)
    );

    snapshot = await getDocs(q);

    if (!snapshot.empty) {
        return snapshot.docs[0].data().email;
    }

    // Search Experts

    q = query(
        collection(db, "experts"),
        where("phone", "==", input)
    );

    snapshot = await getDocs(q);

    if (!snapshot.empty) {
        return snapshot.docs[0].data().email;
    }

    q = query(
        collection(db, "experts"),
        where("userId", "==", input)
    );

    snapshot = await getDocs(q);

    if (!snapshot.empty) {
        return snapshot.docs[0].data().email;
    }

    return null;
};

/*
-------------------------------------
Login
-------------------------------------
*/

export const loginUser = async (
    loginInput,
    password
) => {

    let email = loginInput;

    // If input is NOT an email

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(loginInput)) {

        email = await findEmail(loginInput);

        if (!email) {
            throw new Error(
                "Account not found."
            );
        }
    }

    console.log("Login Input:", loginInput);
    console.log("Resolved Email:", email);
    console.log("Password:", password);

    const credential =
        await signInWithEmailAndPassword(

            auth,

            email,

            password

        );

    await credential.user.reload();

    if (!credential.user.emailVerified) {

        await signOut(auth);

        throw new Error(
            "Please verify your email before logging in."
        );

    }

    return credential.user;

};