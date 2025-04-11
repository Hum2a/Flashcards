import { signInWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../firebase';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const methods = await fetchSignInMethodsForEmail(auth, result.user.email);
    return {
      success: true,
      user: result.user,
      isNewUser: methods.length === 1 && methods[0] === 'google.com'
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return {
      success: false,
      error: error.code === 'auth/popup-closed-by-user'
        ? 'Sign-in cancelled'
        : 'Could not sign in with Google. Please try again.'
    };
  }
};

export const signInWithApple = async () => {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    const methods = await fetchSignInMethodsForEmail(auth, result.user.email);
    return {
      success: true,
      user: result.user,
      isNewUser: methods.length === 1 && methods[0] === 'apple.com'
    };
  } catch (error) {
    console.error('Apple sign-in error:', error);
    return {
      success: false,
      error: error.code === 'auth/popup-closed-by-user'
        ? 'Sign-in cancelled'
        : 'Could not sign in with Apple. Please try again.'
    };
  }
}; 