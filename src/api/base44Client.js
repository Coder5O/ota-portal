import {
  auth,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutUser,
  requestPasswordReset,
  resetPasswordWithCode,
  getCurrentUserToken,
  getOrCreateUserProfile,
} from "@/lib/firebase";
import { storage } from "@/lib/firebase/client";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { createEntitiesProxy } from "@/lib/firebase/firestore-adapter";
import { currentUrl } from "@/lib/authReturnTo";

/**
 * Firebase-backed client adapter preserving the Base44 API surface for all UI components.
 */
export const base44 = {
  auth: {
    hasToken: () => Boolean(auth.currentUser),
    authStateReady: () => auth.authStateReady(),
    me: async () => {
      if (typeof window === "undefined") return null;
      await auth.authStateReady();
      if (!auth.currentUser) {
        const err = new Error("Unauthorized");
        err.status = 401;
        throw err;
      }
      return getOrCreateUserProfile(auth.currentUser);
    },
    loginViaEmailPassword: async (email, password) => {
      return loginWithEmail(email, password);
    },
    loginWithProvider: async (provider, returnTo) => {
      const user = await loginWithGoogle();
      if (returnTo && typeof window !== "undefined") {
        window.location.href = returnTo;
      }
      return user;
    },
    register: async ({ email, password }) => {
      return registerWithEmail(email, password);
    },
    verifyOtp: async () => {
      await auth.authStateReady();
      const token = await getCurrentUserToken();
      return { access_token: token };
    },
    resendOtp: async () => {
      return { success: true };
    },
    setToken: () => {
      // Firebase automatically manages session persistence
    },
    logout: async (origin) => {
      await logoutUser();
      if (origin && typeof window !== "undefined") {
        window.location.href = origin;
      }
    },
    redirectToLogin: (returnTo) => {
      if (typeof window !== "undefined") {
        const dest = returnTo || currentUrl();
        window.location.href = `/login?returnTo=${encodeURIComponent(dest)}`;
      }
    },
    resetPasswordRequest: async (email) => {
      return requestPasswordReset(email);
    },
    resetPassword: async ({ resetToken, newPassword }) => {
      return resetPasswordWithCode(resetToken, newPassword);
    },
  },
  entities: createEntitiesProxy(),
  integrations: {
    Core: {
      UploadPublicFile: async ({ file }) => {
        if (!file) return { file_url: "" };
        try {
          const safeName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, "_") : "upload";
          const fileReference = storageRef(storage, `public/${Date.now()}_${safeName}`);
          const snapshot = await uploadBytes(fileReference, file);
          const file_url = await getDownloadURL(snapshot.ref);
          return { file_url };
        } catch (err) {
          console.warn("[Storage] Public upload falling back:", err?.message || err);
          return { file_url: URL.createObjectURL(file) };
        }
      },
      UploadPrivateFile: async ({ file }) => {
        if (!file) return { file_uri: "" };
        try {
          const safeName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, "_") : "document";
          const fileReference = storageRef(storage, `private/${Date.now()}_${safeName}`);
          const snapshot = await uploadBytes(fileReference, file);
          const file_uri = await getDownloadURL(snapshot.ref);
          return { file_uri };
        } catch (err) {
          console.warn("[Storage] Private upload falling back to document record:", err?.message || err);
          return { file_uri: `ota-doc://${file.name || "supporting_document"}` };
        }
      },
      CreateFileSignedUrl: async ({ file_uri }) => {
        return { signed_url: file_uri };
      },
    },
  },
};
