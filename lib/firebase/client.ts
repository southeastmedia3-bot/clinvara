"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  sendEmailVerification,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type ConfirmationResult,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const firebaseDb = getFirestore(app);
firebaseAuth.useDeviceLanguage();

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export function getRecaptchaVerifier(containerId: string) {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
      size: "invisible",
    });
  }
  return window.recaptchaVerifier;
}

export async function sendFirebaseOtp(phoneNumber: string, recaptchaContainerId: string) {
  const verifier = getRecaptchaVerifier(recaptchaContainerId);
  window.confirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, verifier);
}

export async function verifyFirebaseOtp(otp: string) {
  if (!window.confirmationResult) {
    throw new Error("Please request an OTP first.");
  }
  return window.confirmationResult.confirm(otp);
}

export async function signInFirebaseEmail(email: string, password: string) {
  return signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function signInFirebaseGoogle() {
  return signInWithPopup(firebaseAuth, new GoogleAuthProvider());
}

export async function signInFirebaseFacebook() {
  return signInWithPopup(firebaseAuth, new FacebookAuthProvider());
}

export async function createFirebaseEmailAccount({
  email,
  password,
  displayName,
}: {
  email: string;
  password: string;
  displayName: string;
}) {
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    password,
  );
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  let verificationEmailSent = true;
  try {
    await sendEmailVerification(credential.user);
  } catch {
    verificationEmailSent = false;
  }
  return { credential, verificationEmailSent };
}
