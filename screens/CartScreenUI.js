import { createStackNavigator } from "@react-navigation/stack";
import CartScreen from "./CartScreen";
import CheckoutScreen from "./CheckoutScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useContext } from "react";
import { CartContext } from "../context/Context";
import Colors from "../colors/Color";

function CartScreenUI() {
  const Stack = createStackNavigator();
  const { isCheckout, setCheckout } = useContext(CartContext);

  return (
    <Stack.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: route.name === "Cart" ? false : true,
        headerLeft: null,
        headerStyle: {
          backgroundColor: Colors.primary500,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerRight: () => {
          if (route.name !== "Cart")
            return (
              <Ionicons
                name="arrow-back"
                size={32}
                color="black"
                onPress={() => {
                  setCheckout(false);
                  navigation.goBack();
                }}
              />
            );
        },
      })}
    >
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}

export default CartScreenUI;
