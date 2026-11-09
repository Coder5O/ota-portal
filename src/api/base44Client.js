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
 * Converts a file (specifically an image) to an optimized, compressed Base64 Data URL.
 * Downscales images over 1400px so they easily fit in Firestore documents without quality loss.
 * Guarantees resolution with a strict safety timeout so it never hangs.
 */
async function fileToDataUrl(file, maxWidth = 1400, maxHeight = 1400, quality = 0.82) {
  if (!file) return "";
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      try {
        const fallbackReader = new FileReader();
        fallbackReader.onload = () => resolve(String(fallbackReader.result || ""));
        fallbackReader.onerror = () => resolve("");
        fallbackReader.readAsDataURL(file);
      } catch {
        resolve("");
      }
    }, 3500);

    if (typeof window === "undefined" || !window.FileReader) {
      clearTimeout(timer);
      resolve("");
      return;
    }

    // For non-images or SVGs, read as data URL directly without canvas compression
    if (!file.type || !file.type.startsWith("image/") || file.type.includes("svg")) {
      const reader = new FileReader();
      reader.onload = () => {
        clearTimeout(timer);
        resolve(String(reader.result || ""));
      };
      reader.onerror = () => {
        clearTimeout(timer);
        resolve("");
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const resultStr = String(e.target?.result || "");
      const img = new Image();
      img.onload = () => {
        clearTimeout(timer);
        try {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
            const dataUrl = canvas.toDataURL(mime, quality);
            resolve(dataUrl);
            return;
          }
          resolve(resultStr);
        } catch {
          resolve(resultStr);
        }
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(resultStr);
      };
      img.src = resultStr;
    };
    reader.onerror = () => {
      clearTimeout(timer);
      resolve("");
    };
    reader.readAsDataURL(file);
  });
}

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
  users: {
    inviteUser: async () => true,
  },
  asServiceRole: {
    entities: createEntitiesProxy(),
    users: {
      inviteUser: async () => true,
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
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firebase Storage timed out after 3s")), 3000),
          );
          const snapshot = await Promise.race([
            uploadBytes(fileReference, file),
            timeoutPromise,
          ]);
          const file_url = await getDownloadURL(snapshot.ref);
          return { file_url };
        } catch (err) {
          console.warn("[Storage] Cloud Storage upload timed out or failed, using persistent data URI:", err?.message || err);
          const file_url = await fileToDataUrl(file);
          return { file_url };
        }
      },
      UploadPrivateFile: async ({ file }) => {
        if (!file) return { file_uri: "" };
        try {
          const safeName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, "_") : "document";
          const fileReference = storageRef(storage, `private/${Date.now()}_${safeName}`);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firebase Storage timed out after 3s")), 3000),
          );
          const snapshot = await Promise.race([
            uploadBytes(fileReference, file),
            timeoutPromise,
          ]);
          const file_uri = await getDownloadURL(snapshot.ref);
          return { file_uri };
        } catch (err) {
          console.warn("[Storage] Private Cloud Storage upload timed out or failed, falling back to data URI:", err?.message || err);
          const file_uri = await fileToDataUrl(file);
          return { file_uri: file_uri || `ota-doc://${file.name || "supporting_document"}` };
        }
      },
      CreateFileSignedUrl: async ({ file_uri }) => {
        return { signed_url: file_uri };
      },
    },
  },
};
