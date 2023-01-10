import { View, Text, StyleSheet, Button, TextInput } from "react-native";
import Swipeout from "react-native-swipeout";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useContext, useState } from "react";
import { useSelector } from "react-redux";
import {
  incrementCart,
  decrementCart,
  removeCart,
  addToCart,
} from "../redux/addOrderSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { AuthContext } from "../store/auth-context";

const BACKEND_URL =
  "https://allabotteristorante-f2d5e-default-rtdb.europe-west1.firebasedatabase.app/";
function ProductUserContainer({ item, isSwipeable }) {
  const [value, setValue] = useState("0");
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  let swipeBtns = [
    {
      backgroundColor: "white",
      onPress: () => dispatch(removeCart({ id: item.key })),
      component: <Ionicons name="ios-trash" size={32} color="red" />,
    },
  ];

  useEffect(() => {
    let present = cart.filter((itemCart) => item.key === itemCart.id);
    if (present !== null && present.length === 1)
      setValue(String(present[0].quantity));
    else setValue("0");
  }, [cart]);

  return (
    <View style={styles.outsideView}>
      <Swipeout
        right={swipeBtns}
        autoClose={true}
        backgroundColor="transparent"
        buttonWidth={35}
        disabled={isSwipeable === null || isSwipeable === false ? true : false}
      >
        <View style={styles.outsideInsideView}>
          <View style={styles.insideView}>
            <Text style={styles.nameStyle}>{item.name}</Text>
            <Text style={styles.priceStyle}>{"\u20AC" + item.price}</Text>
          </View>
          <View style={styles.modifyView}>
            <Button
              title="+"
              onPress={() => {
                if (Number(value) < 99) {
                  if (Number(value) === 0) {
                    dispatch(
                      addToCart({
                        id: item.key,
                        name: item.name,
                        price: item.price,
                      })
                    );
                    setValue(String(Number(value) + 1));
                  } else {
                    setValue(String(Number(value) + 1));
                    dispatch(incrementCart({ id: item.key }));
                  }
                }
              }}
            />
            <TextInput
              value={value}
              maxLength={2}
              width={15}
              textAlign="center"
            />
            <Button
              title="-"
              onPress={() => {
                if (Number(value) > 1) {
                  setValue(String(Number(value) - 1));
                  dispatch(decrementCart({ id: item.key }));
                } else if (Number(value) === 1) {
                  setValue("0");
                  dispatch(removeCart({ id: item.key }));
                }
              }}
            />
          </View>
        </View>
      </Swipeout>
    </View>
  );
}

export default ProductUserContainer;

const styles = StyleSheet.create({
  outsideView: {
    flex: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    padding: 8,
    margin: 8,
    borderRadius: 8,
    backgroundColor: "white",
  },
  insideView: {
    flex: 1,
    width: "100%",
  },
  outsideInsideView: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
  },
  modifyView: {
    flexDirection: "row",
  },
  nameStyle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  priceStyle: {
    fontSize: 12,
  },
});
