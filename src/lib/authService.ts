import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
  UserCredential
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'super_admin';
  displayName?: string;
  createdAt?: Date;
  lastLogin?: Date;
}

// Admin role verification
export const verifyAdminRole = async (user: User): Promise<boolean> => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    const adminData = adminDoc.data();

    // For testing: Allow any user with admin email or if admin document exists
    if (user.email === 'admin@kidzzone.com' || (adminDoc.exists() && adminData?.role === 'admin')) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error verifying admin role:', error);
    // For testing: Allow admin@kidzzone.com even if Firestore fails
    return user.email === 'admin@kidzzone.com';
  }
};

// Sign in admin
export const signInAdmin = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Verify admin role
    const isAdmin = await verifyAdminRole(userCredential.user);
    if (!isAdmin) {
      await signOut(auth);
      throw new Error('Access denied. Admin privileges required.');
    }

    // Update last login (ignore errors for testing)
    try {
      await setDoc(doc(db, 'admins', userCredential.user.uid), {
        lastLogin: new Date(),
        email: userCredential.user.email,
        role: 'admin',
        displayName: 'Admin',
        isActive: true
      }, { merge: true });
    } catch (firestoreError) {
      console.warn('Could not update admin document:', firestoreError);
      // Continue anyway for testing
    }

    return userCredential;
  } catch (error: any) {
    console.error('Admin sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Sign out admin
export const signOutAdmin = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Send password reset email
export const sendAdminPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Change password (requires current password for reauthentication)
export const changeAdminPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user found');
    }

    // Reauthenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    console.error('Password change error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Get current admin user
export const getCurrentAdmin = (): Promise<AdminUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        const isAdmin = await verifyAdminRole(user);
        if (isAdmin) {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          const adminData = adminDoc.data();
          resolve({
            uid: user.uid,
            email: user.email!,
            role: adminData?.role || 'admin',
            displayName: user.displayName || adminData?.displayName,
            createdAt: adminData?.createdAt?.toDate(),
            lastLogin: adminData?.lastLogin?.toDate()
          });
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

// Auth state listener
export const onAdminAuthStateChanged = (callback: (admin: AdminUser | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const isAdmin = await verifyAdminRole(user);
      if (isAdmin) {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        const adminData = adminDoc.data();
        callback({
          uid: user.uid,
          email: user.email!,
          role: adminData?.role || 'admin',
          displayName: user.displayName || adminData?.displayName,
          createdAt: adminData?.createdAt?.toDate(),
          lastLogin: adminData?.lastLogin?.toDate()
        });
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// Create admin user (for initial setup)
export const createAdminUser = async (email: string, password: string, displayName?: string): Promise<void> => {
  try {
    // Note: This should be done through Firebase Admin SDK in production
    // For demo purposes, we'll create the admin record directly
    const adminData = {
      email,
      role: 'admin',
      displayName: displayName || 'Admin',
      createdAt: new Date(),
      isActive: true
    };

    // In production, you would create the user through Firebase Admin SDK
    // and then add the admin role to Firestore
    console.log('Admin user data prepared:', adminData);

    // For now, we'll just log this - in production you'd use Firebase Admin SDK
    throw new Error('Admin user creation must be done through Firebase Console or Admin SDK');
  } catch (error) {
    console.error('Create admin user error:', error);
    throw error;
  }
};

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No admin account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This admin account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/requires-recent-login':
      return 'Please log in again to change your password.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};

// Validate password strength
export const validatePasswordStrength = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number.' };
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (@$!%*?&).' };
  }

  return { isValid: true, message: 'Password is strong.' };
};
