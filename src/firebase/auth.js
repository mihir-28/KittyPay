import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

const googleProvider = new GoogleAuthProvider();

// Sign up with email and password
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with displayName
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await createUserProfile(user, { displayName });
    
    return { user };
  } catch (error) {
    return { error };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error) {
    return { error };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if this is a new user
    const userDocRef = doc(db, "users", result.user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create user profile if first time signing in with Google
      await createUserProfile(result.user);
    }
    
    return { user: result.user };
  } catch (error) {
    return { error };
  }
};

// Send email link for passwordless sign-in
export const sendSignInLink = async (email, redirectUrl) => {
  try {
    // Configure the action code settings
    const actionCodeSettings = {
      url: redirectUrl || window.location.origin,
      handleCodeInApp: true,
    };
    
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    // Save the email locally to remember the user when they complete sign-in
    localStorage.setItem('emailForSignIn', email);
    
    return { success: true };
  } catch (error) {
    return { error };
  }
};

// Complete email link sign-in
export const completeSignInWithEmailLink = async (email = null) => {
  try {
    // Confirm the link is a sign-in with email link
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      return { error: { message: 'Invalid sign-in link' } };
    }
    
    // Get the email if not provided
    let emailToUse = email;
    if (!emailToUse) {
      emailToUse = localStorage.getItem('emailForSignIn');
      
      if (!emailToUse) {
        // User opened the link on a different device
        // Ask the user for their email
        return { promptForEmail: true };
      }
    }
    
    // Sign in the user
    const result = await signInWithEmailLink(auth, emailToUse, window.location.href);
    
    // Clear email from storage
    localStorage.removeItem('emailForSignIn');
    
    // Create user profile if new user
    if (result.user.metadata.creationTime === result.user.metadata.lastSignInTime) {
      await createUserProfile(result.user);
    }
    
    return { user: result.user };
  } catch (error) {
    return { error };
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    return { error };
  }
};

// Password reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { error };
  }
};

// Create user profile in Firestore
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;
  
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  
  if (!snapshot.exists()) {
    const { email, displayName, photoURL } = user;
    
    try {
      await setDoc(userRef, {
        displayName: displayName || additionalData.displayName || '',
        email,
        photoURL: photoURL || '',
        createdAt: serverTimestamp(),
        ...additionalData
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  }
  
  return userRef;
};

// Auth state listener
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};