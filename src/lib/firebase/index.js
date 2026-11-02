export { app, auth, db } from "./client";
export {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutUser,
  requestPasswordReset,
  resetPasswordWithCode,
  getCurrentUserToken,
  getOrCreateUserProfile,
  onAuthStateSubscription,
} from "./auth";
