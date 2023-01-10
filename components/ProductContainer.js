import { View, Text, StyleSheet } from "react-native";
import Swipeout from "react-native-swipeout";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";
import { BACKEND_URL } from "../util/secret-variables";

function ProductContainer({ item, setModifyItem, settleVisibility }) {
  let swipeBtns = [
    {
      backgroundColor: "white",
      onPress: () => axios.delete(BACKEND_URL + "/data/" + item.key + ".json"),
      component: <Ionicons name="ios-trash" size={32} color="red" />,
    },
    {
      backgroundColor: "white",
      onPress: () => {
        setModifyItem(item);
        settleVisibility(true);
      },
      component: <Ionicons name="pencil" size={32} color="green" />,
    },
  ];

  return (
    <View style={styles.outsideView}>
      <Swipeout
        right={swipeBtns}
        autoClose={true}
        backgroundColor="transparent"
        buttonWidth={35}
      >
        <View style={styles.insideView}>
          <View style={styles.insideView}>
            <Text style={styles.nameStyle}>{item.name}</Text>
            <Text style={styles.priceStyle}>{"\u20AC" + item.price}</Text>
          </View>
        </View>
      </Swipeout>
    </View>
  );
}

export default ProductContainer;

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
  nameStyle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  priceStyle: {
    fontSize: 12,
  },
});
