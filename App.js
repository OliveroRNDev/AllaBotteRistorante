import { StatusBar } from "react-native";
import { Platform, SafeAreaView } from "react-native";
import SplashScreen from "react-native-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import Colors from "./colors/Color";
import { useState, useContext, useEffect } from "react";
import { CartContext, UserContext } from "./context/Context";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import AuthContextProvider, { AuthContext } from "./store/auth-context";
import { PersistGate } from "redux-persist/integration/react";
import { auth, db } from "./util/firebase-config";
import messaging from "@react-native-firebase/messaging";
import { updateUserTokenData } from "./util/utils";
import axios from "axios";
import { BACKEND_URL } from "./util/secret-variables";
import Toast from "./components/Toast";
import AdminAuth from "./screens/AdminAuth";
import UserAuth from "./screens/UserAuth";
import UserAuthentication from "./screens/UserAuthentication";
import { onValue, ref } from "firebase/database";
import { ProductContext } from "./context/Context";

const requestUserPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  } catch (err) {
    //error
  }
};

function UserTypeStack({ goBack, isSignUp, isCheckout }) {
  const authCtx = useContext(AuthContext);
  const [productList, setProducts] = useState(null);

  useEffect(() => {
    return onValue(ref(db, "/data"), (querySnapShot) => {
      let products = [];
      querySnapShot.forEach((documentSnapshot) => {
        products.push({
          ...documentSnapshot.val(),
          key: documentSnapshot.key,
        });
      });
      products.sort(function (a, b) {
        return a.place.localeCompare(b.place) > 0;
      });
      let prev = null;
      let temp = [];
      let full_array = [];
      products.forEach((element) => {
        if (prev === null) {
          full_array.push({ place: element.place, isDivider: true });
          temp.push(element);
          prev = element;
        } else if (prev.place !== element.place) {
          temp.sort(function (a, b) {
            return a.name.localeCompare(b.name) > 0;
          });
          temp.forEach((element) => {
            full_array.push(element);
          });
          prev = element;
          temp = [];
          temp.push(element);
          full_array.push({ place: element.place, isDivider: true });
        } else {
          temp.push(element);
        }
      });
      if (temp !== null && temp.length > 0) {
        temp.sort(function (a, b) {
          return a.name.localeCompare(b.name) > 0;
        });
        temp.forEach((element) => {
          full_array.push(element);
        });
      }
      setProducts(full_array);
    });
  }, []);

  useEffect(() => {
    //token upload for notifications
    auth.onAuthStateChanged(async (user) => {
      if (user !== null) {
        try {
          messaging()
            .getToken()
            .then(async (token) => {
              const response = await axios
                .get(BACKEND_URL + "/user.json")
                .then((response) => {
                  const key = Object.keys(response.data);
                  const value = Object.values(response.data);
                  let i = 0;
                  value.forEach((documentSnapshot) => {
                    if (documentSnapshot.uid === user.uid) {
                      if (
                        documentSnapshot.token === null ||
                        documentSnapshot.token === undefined
                      ) {
                        //set database token
                        let temp = documentSnapshot;
                        temp.token = token;
                        updateUserTokenData(temp, key[i]);
                      } else if (documentSnapshot.token !== token) {
                        //update token
                        let temp = documentSnapshot;
                        temp.token = token;
                        updateUserTokenData(temp, key[i]);
                      }
                    }
                    i++;
                  });
                })
                .catch((err) => {
                  //error
                });
            });
        } catch (err) {
          //error
        }
        authCtx.authenticate(user.uid);
      }
    });
  }, []);

  return (
    <ProductContext.Provider value={productList}>
      {authCtx.isAuthenticated && authCtx.userType === "admin" && (
        <AdminAuth
          goBack={goBack}
          isSignUp={isSignUp}
          isCheckout={isCheckout}
        />
      )}
      {!authCtx.isAuthenticated && (
        <UserAuthentication
          goBack={goBack}
          isSignUp={isSignUp}
          isCheckout={isCheckout}
        />
      )}
      {authCtx.isAuthenticated && authCtx.userType === "user" && (
        <UserAuth goBack={goBack} isSignUp={isSignUp} isCheckout={isCheckout} />
      )}
    </ProductContext.Provider>
  );
}

export default function App() {
  const [goBack, setGoBack] = useState(false);
  const [isSignUp, setSignUp] = useState(false);
  const [isCheckout, setCheckout] = useState(false);

  useEffect(() => {
    SplashScreen.hide(); //hides the splash screen on app load.
    if (Platform.OS === "ios") requestUserPermission();
  }, []);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <Toast>
          <StatusBar backgroundColor={Colors.primary500} />
          <AuthContextProvider>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <UserContext.Provider value={{ goBack, setGoBack, setSignUp }}>
                  <NavigationContainer>
                    <CartContext.Provider value={{ isCheckout, setCheckout }}>
                      <UserTypeStack
                        goBack={goBack}
                        isSignUp={isSignUp}
                        isCheckout={isCheckout}
                      />
                    </CartContext.Provider>
                  </NavigationContainer>
                </UserContext.Provider>
              </PersistGate>
            </Provider>
          </AuthContextProvider>
        </Toast>
      </SafeAreaView>
    </>
  );
}
