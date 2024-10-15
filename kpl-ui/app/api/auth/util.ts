import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  getAuth,
} from "firebase/auth";

// auth is imported from firebase.ts
import { auth } from "@/utils/firebase";

export const signUp = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = () => {
  return signOut(auth);
};

// export const verifyIdToken = (idToken: string) => {
//   // TODO: Implement this function
//   getAuth().verifyIdToken(idToken);
  
// }