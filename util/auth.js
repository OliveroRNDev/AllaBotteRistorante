import { auth } from "./firebase-config";
import { storeUser, storeSensitiveUser } from "./utils";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "react-native-toast-notifications";

const toast = useToast();

function errorResponse(error) {
  if (error.code === "auth/email-already-in-use") {
    toast.show("E-mail già usata!", {
      placement: "top",
      type: "custom_type_error",
    });
  }

  if (error.code === "auth/invalid-email") {
    toast.show("E-mail non valida!", {
      placement: "top",
      type: "custom_type_error",
    });
  }
  if (error.code === "auth/invalid-password") {
    toast.show("Password non valida!", {
      placement: "top",
      type: "custom_type_error",
    });
  }
}

export async function createUser(email, password) {
  let result = true;
  try {
    await createUserWithEmailAndPassword(auth, email, password).then(
      async (userData) => {
        const responseSensitive = await storeSensitiveUser({
          uid: userData.user.uid,
          userType: "user",
          email: userData.user.email,
        });
        await storeUser(
          {
            uid: userData.user.uid,
            userType: "user",
          },
          responseSensitive
        );
      }
    );
  } catch (error) {
    errorResponse(error);
    result = false;
  }
  return result;
}

export async function signIn(email, password) {
  let result = true;
  try {
    await signInWithEmailAndPassword(auth, email, password).then(() => {});
  } catch (error) {
    errorResponse(error);
    result = false;
  }
  return result;
}
