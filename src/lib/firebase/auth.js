import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./client";

// Ensure local persistence is set
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn("Failed to set Firebase Auth persistence:", err);
  });
}

const googleProvider = new GoogleAuthProvider();

/**
 * Fetch or initialize the user document in Firestore.
 */
export async function getOrCreateUserProfile(firebaseUser, additionalData = {}) {
  if (!firebaseUser) return null;

  const userRef = doc(db, "users", firebaseUser.uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        full_name: data.full_name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
        role: data.role || "user",
        institution_slug: data.institution_slug || "",
        officer_title: data.officer_title || "",
        approval_authority: data.approval_authority || "",
        ...data,
      };
    }

    // New user profile
    const newProfile = {
      email: firebaseUser.email,
      full_name: additionalData.full_name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
      role: "user", // Normal user by default - cannot self-elevate
      institution_slug: "",
      officer_title: "",
      approval_authority: "",
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };

    await setDoc(userRef, newProfile);
    return {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      ...newProfile,
    };
  } catch (error) {
    console.error("Error fetching user profile from Firestore:", error);
    // Return fallback profile from Auth object so app doesn't crash if Firestore is offline/unreachable
    return {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      full_name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
      role: "user",
      institution_slug: "",
      officer_title: "",
      approval_authority: "",
    };
  }
}

/**
 * Formats Firebase auth error codes into user-friendly messages
 */
export function formatAuthError(error) {
  if (!error) return "";
  const code = error.code || "";
  const host = typeof window !== "undefined" ? window.location.hostname : "your domain";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters long.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Access to this account has been temporarily disabled due to many failed login attempts. Please try again later.";
    case "auth/popup-closed-by-user":
      return "Sign-in cancelled: The Google popup window was closed.";
    case "auth/cancelled-popup-request":
      return "Sign-in cancelled: Multiple popup requests were initiated.";
    case "auth/popup-blocked":
      return "The Google sign-in popup was blocked by your browser. Please allow popups for this site.";
    case "auth/unauthorized-domain":
      return `Domain not authorized for Google Sign-In. Please add "${host}" under Firebase Console -> Authentication -> Settings -> Authorized domains.`;
    case "auth/operation-not-allowed":
      return "Google Sign-In is not enabled for this project. Please enable Google provider under Firebase Console -> Authentication -> Sign-in method.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return error.message?.replace(/^Firebase:\s*/i, "") || "An authentication error occurred.";
  }
}

/**
 * Sign in via email and password
 */
export async function loginWithEmail(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return await getOrCreateUserProfile(credential.user);
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
}

/**
 * Register via email and password
 */
export async function registerWithEmail(email, password, additionalData = {}) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    return await getOrCreateUserProfile(credential.user, additionalData);
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
}

/**
 * Sign in via Google OAuth
 */
export async function loginWithGoogle() {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    return await getOrCreateUserProfile(credential.user);
  } catch (error) {
    if (error.code === "auth/popup-blocked") {
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectErr) {
        throw new Error(formatAuthError(redirectErr));
      }
    }
    throw new Error(formatAuthError(error));
  }
}

/**
 * Handle redirect result after OAuth redirect flow
 */
export async function checkOAuthRedirectResult() {
  if (typeof window === "undefined") return null;
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return await getOrCreateUserProfile(result.user);
    }
  } catch (error) {
    console.warn("OAuth redirect error:", error);
  }
  return null;
}

/**
 * Log out
 */
export async function logoutUser() {
  return signOut(auth);
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email) {
  return sendPasswordResetEmail(auth, email.trim());
}

/**
 * Confirm password reset
 */
export async function resetPasswordWithCode(actionCode, newPassword) {
  return confirmPasswordReset(auth, actionCode, newPassword);
}

/**
 * Get current user token for server API calls
 */
export async function getCurrentUserToken() {
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken();
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateSubscription(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await getOrCreateUserProfile(firebaseUser);
      callback(profile);
    } else {
      callback(null);
    }
  });
}
