import { createDrawerNavigator } from "@react-navigation/drawer";
import { Text, View, StyleSheet } from "react-native";
import Colors from "../colors/Color";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import UserHandleScreen from "./UserHandleScreen";
import RestaurantProductsUI from "./RestaurantProductsUI";
import UserReservationUI from "./UserReservationUI";
import { ProductContext } from "../context/Context";
import { TouchableOpacity } from "react-native";
import CartScreenUI from "./CartScreenUI";
import { useContext } from "react";

function UserAuthentication({ goBack, isSignUp }) {
  const Drawer = createDrawerNavigator();
  const [quantity, setQuantity] = useState(0);
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

  return (
    <Drawer.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: goBack === true ? false : true,
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
      <Drawer.Screen name="Prenotazione" component={UserReservationUI} />
      <Drawer.Screen name="Log-in" component={UserHandleScreen} />
    </Drawer.Navigator>
  );
}

export default UserAuthentication;

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
