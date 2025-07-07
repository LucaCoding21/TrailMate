import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from './config';

export interface AuthUser {
  uid: string;
  email: string;
  phoneNumber?: string;
  displayName?: string;
}

export const signUpWithEmail = async (
  email: string,
  password: string,
  phoneNumber: string,
  displayName?: string
): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name and phone number
    await updateProfile(user, {
      displayName: displayName || email.split('@')[0],
    });

    // Store phone number in user metadata (we'll use custom claims or Firestore for this)
    // For now, we'll store it in displayName or use a separate field

    const authUser: AuthUser = {
      uid: user.uid,
      email: user.email!,
      phoneNumber,
      displayName: displayName || email.split('@')[0],
    };

    console.log('Successfully signed up:', authUser.email);
    return { success: true, user: authUser };
  } catch (error: any) {
    console.error('Sign up error:', error);
    let errorMessage = 'Failed to create account. Please try again.';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const authUser: AuthUser = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || user.email!.split('@')[0],
    };

    console.log('Successfully signed in:', authUser.email);
    return { success: true, user: authUser };
  } catch (error: any) {
    console.error('Sign in error:', error);
    let errorMessage = 'Failed to sign in. Please try again.';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const signOutAsync = async (): Promise<void> => {
  try {
    console.log('Starting sign out process...');
    await signOut(auth);
    console.log('Successfully signed out - auth state should update automatically');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
}; 