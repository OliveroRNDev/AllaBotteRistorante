import { useContext } from "react";
import { Button, View, FlatList, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ProductCartContainer from "../components/ProductCartContainer";
import { CartContext, ProductContext } from "../context/Context";
import { AuthContext } from "../store/auth-context";
import { useToast } from "react-native-toast-notifications";
import { removeCart } from "../redux/addOrderSlice";
import { useEffect } from "react";

function CartScreen({ navigation }) {
  const cart = useSelector((state) => state.cart);
  const authCtx = useContext(AuthContext);
  const { isCheckout, setCheckout } = useContext(CartContext);
  const toast = useToast();
  const productList = useContext(ProductContext);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (isCheckout) setCheckout(false);
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation, isCheckout]);

  useEffect(() => {
    if (productList !== null)
      cart.forEach((element) => {
        const list = productList.filter(
          (listItem) => listItem.key === element.id
        );
        if (list.length === 0) {
          dispatch(removeCart({ id: element.id }));
        }
      });
  }, [productList]);

  return (
    <View>
      {cart.length === 0 ? (
        <View style={{ margin: 8 }}>
          <Text>Non ci sono prodotti</Text>
        </View>
      ) : (
        <>
          <View style={{ height: "85%" }}>
            <FlatList
              data={cart}
              renderItem={({ item }) => {
                if (productList !== null) {
                  const list = productList.filter(
                    (listItem) => listItem.key === item.id
                  );
                  if (list.length > 0)
                    return (
                      <ProductCartContainer item={item} isSwipeable={false} />
                    );
                }
              }}
              keyExtractor={(item) => item.id}
            />
          </View>
          <View
            style={{
              height: "15%",
              width: "100%",
              padding: 10,
              borderRadius: 25,
            }}
          >
            <Button
              title="Checkout"
              onPress={() => {
                console.log(authCtx.userUID);
                if (authCtx.userUID !== null && authCtx.userUID !== undefined) {
                  setCheckout(true);
                  navigation.navigate("Checkout");
                } else {
                  toast.show("Devi effettuare il login per fare il checkout!", {
                    placement: "top",
                    type: "custom_type_error",
                  });
                }
              }}
            />
          </View>
        </>
      )}
    </View>
  );
}

export default CartScreen;
