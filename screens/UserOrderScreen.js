import { Text, View } from "react-native";
import Colors from "../colors/Color";
import { useState, useEffect, useContext } from "react";
import { db } from "../util/firebase-config";
import { ref, onValue } from "firebase/database";
import { AuthContext } from "../store/auth-context";
import { FlatList } from "react-native-gesture-handler";
import UserOrderView from "../components/UserOrderView";
import { ActivityIndicator } from "react-native";

function UserOrderScreen() {
  const [productList, setProducts] = useState(null);
  const userCtx = useContext(AuthContext);

  useEffect(() => {
    return onValue(
      ref(db, "/cart_order" + "/" + userCtx.userUID),
      (querySnapShot) => {
        let products = [];
        querySnapShot.forEach((documentSnapshot) => {
          products.push({
            cart: documentSnapshot.val().cart,
            key: documentSnapshot.key,
            customer: documentSnapshot.val().cart,
            payment_id: documentSnapshot.val().payment_id,
            status: documentSnapshot.val().payment_status,
            date: new Date(documentSnapshot.val().date),
            phone: documentSnapshot.val().phone,
            payAtPickup: documentSnapshot.val().payAtPickup,
          });
        });
        products.sort(function (a, b) {
          return b.date - a.date;
        });
        setProducts(products);
      }
    );
  }, [userCtx.userUID]);
  return (
    <>
      {productList === null ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={Colors.primary500} />
        </View>
      ) : null}
      {productList !== null && productList.length === 0 ? (
        <View style={{ flex: 1, margin: 8 }}>
          <Text>Non ci sono ordini</Text>
        </View>
      ) : (
        <FlatList
          data={productList}
          style={{ flex: 1 }}
          renderItem={({ item }) => {
            return <UserOrderView item={item} />;
          }}
          keyExtractor={(item) => item.key}
        />
      )}
    </>
  );
}

export default UserOrderScreen;
