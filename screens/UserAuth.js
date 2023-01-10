import { Text, View, StyleSheet } from "react-native";
import Colors from "../colors/Color";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { useToast } from "react-native-toast-notifications";
import { AuthContext } from "../store/auth-context";
import RestaurantProductsUI from "./RestaurantProductsUI";
import ReservationStatus from "./ReservationStatus";
import { TouchableOpacity } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import CartScreenUI from "./CartScreenUI";
import UserOrderScreen from "./UserOrderScreen";
import { auth } from "../util/firebase-config";
import { Alert } from "react-native";
import { ProductContext } from "../context/Context";

function UserAuth({ goBack, isSignUp, isCheckout }) {
  const Drawer = createDrawerNavigator();
  const userCtx = useContext(AuthContext);
  const [quantity, setQuantity] = useState(0);
  const toast = useToast();
  const productList = useContext(ProductContext);
  const cart = useSelector((state) => state.cart);

  useEffect(() => {
    let sum = 0;
    if (productList !== null)
      cart.forEach((item) => {
        const list = productList.filter((listItem) => listItem.key === item.id);
        if (list.length > 0) sum += item.quantity;
      });
    setQuantity(sum);
  }, [cart, productList]);

  function CustomDrawerContent(props) {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label="Log-out"
          onPress={async () => {
            props.navigation.closeDrawer();
            await userCtx.logout();
          }}
        />
        <DrawerItem
          label="Cancella account"
          onPress={async () => {
            Alert.alert(
              "Cancellazione",
              "Sei sicuro di voler cancellare l'utente?",
              [
                {
                  text: "Annulla",
                  onPress: () => {},
                  style: "cancel",
                },
                {
                  text: "Accetta",
                  onPress: () => {
                    auth.currentUser
                      .delete()
                      .then(async () => {
                        await userCtx.logout();
                      })
                      .catch((err) => {
                        if (err.code === "auth/requires-recent-login")
                          toast.show(
                            "E' passato troppo tempo dall'ultimo login.\nRifare il login e riprovare",
                            {
                              placement: "top",
                              type: "custom_type_error",
                            }
                          );
                      });
                  },
                  style: "default",
                },
              ]
            );
          }}
        />
      </DrawerContentScrollView>
    );
  }

  return (
    <ProductContext.Provider value={productList}>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ route, navigation }) => ({
          headerShown: goBack === true || isCheckout === true ? false : true,
          headerTintColor: "black",
          headerTitle: () => {
            if (goBack === true) return null;
            else if (route.name === "Log-in" && isSignUp === false)
              return <Text style={styles.titleStyle}>Log-in</Text>;
            else if (route.name === "Log-in" && isSignUp === true)
              return <Text style={styles.titleStyle}>Sign-up</Text>;
            else return <Text style={styles.titleStyle}>{route.name}</Text>;
          },
          headerRight: () => {
            if (route.name !== "Carrello")
              return (
                <View style={{ flexDirection: "row" }}>
                  <View style={{ paddingRight: 10 }}>
                    <Ionicons
                      name="cart"
                      size={32}
                      color="black"
                      onPress={() => {
                        //go to cart
                        navigation.navigate("Carrello");
                      }}
                    />
                  </View>
                  {quantity > 0 ? (
                    <TouchableOpacity
                      disabled={true}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 25,
                        backgroundColor: "red",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        right: 5,
                        top: -5,
                        zIndex: 100,
                      }}
                    >
                      <Text>{quantity}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            else return null;
          },
          headerStyle: {
            backgroundColor: Colors.primary500,
            elevation: 0,
            shadowOpacity: 0,
          },
        })}
      >
        <Drawer.Screen name="Prodotti" component={RestaurantProductsUI} />
        <Drawer.Screen name="Carrello" component={CartScreenUI} />
        <Drawer.Screen name="Prenotazioni" component={ReservationStatus} />
        <Drawer.Screen name="Ordini" component={UserOrderScreen} />
      </Drawer.Navigator>
    </ProductContext.Provider>
  );
}

export default UserAuth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  titleStyle: {
    fontSize: 20,
  },
});
