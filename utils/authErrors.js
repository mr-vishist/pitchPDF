/**
 * Maps Firebase Auth error codes to user-friendly messages
 */
export function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        // Email/Password errors
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password.',

        // Signup errors
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/operation-not-allowed': 'This sign-in method is not enabled.',

        // Google auth errors
        'auth/popup-closed-by-user': 'Sign-in was cancelled.',
        'auth/popup-blocked': 'Pop-up was blocked. Please allow pop-ups for this site.',
        'auth/cancelled-popup-request': 'Sign-in was cancelled.',
        'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',

        // Network errors
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/internal-error': 'Something went wrong. Please try again.',
    };

    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
}
