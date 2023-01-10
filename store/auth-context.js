import { createContext } from "react";
import { useState } from "react";
import { db } from "../util/firebase-config";
import { ref, onValue } from "firebase/database";
import { useEffect } from "react";
import { auth } from "../util/firebase-config";
import { signOut } from "firebase/auth";

export const AuthContext = createContext({
  token: "",
  isAuthenticated: false,
  isAuthenticating: false,
  authenticate: (uid) => {},
  logout: async () => {},
  userType: "",
  getUserType: () => {},
  userUID: "",
});

function AuthContextProvider({ children }) {
  const [userType, setUserType] = useState();
  const [userUID, setUserUID] = useState();
  let user;
  useEffect(() => {
    return onValue(ref(db, "/user"), (querySnapShot) => {
      querySnapShot.forEach((documentSnapshot) => {
        user = documentSnapshot.toJSON();
        if (user.uid === userUID) {
          setUserType(user.userType);
        }
      });
    });
  }, [userUID, user]);

  function authenticate(uid) {
    setUserUID(uid);
  }

  async function logout() {
    await signOut(auth).then(() => {
      setUserType(null);
      setUserUID(null);
    });
  }

  function getUserType() {
    return userType;
  }

  const value = {
    isAuthenticated: !!userUID,
    authenticate: authenticate,
    logout: logout,
    getUserType: getUserType,
    userType: userType,
    userUID: userUID,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
