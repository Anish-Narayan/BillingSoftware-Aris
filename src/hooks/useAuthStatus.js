import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase'; // Adjust path to your firebase config

export const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  // This loading state is crucial to prevent a flicker on page load
  // while Firebase checks the user's token.
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
      }
      setCheckingStatus(false);
    });

    // Cleanup the subscription
    return unsubscribe;
  }, []);

  return { loggedIn, checkingStatus };
};