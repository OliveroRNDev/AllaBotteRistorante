import { StyleSheet, Text, View, ScrollView } from "react-native";
import { FAB } from "react-native-paper";
import { useEffect, useState } from "react";
import { db } from "../util/firebase-config";
import { ref, onValue } from "firebase/database";
import ProductListContainer from "../components/ProductListContainer";
import { restartAppetizer } from "../redux/addOrderSlice";
import { useDispatch } from "react-redux";
import { storeOrder } from "../util/utils";
import Colors from "../colors/Color";
import { useContext } from "react";
import { TableContent } from "../context/Context";
import { ActivityIndicator } from "react-native";

function OrderScreen({ route, navigation }) {
  const [orderView, setOrderView] = useState([]);
  const dispatch = useDispatch();
  let appetizerProducts = [];
  let firstCourseProducts = [];
  let secondCourseProducts = [];
  let dessertProducts = [];
  let productsAdded = [];
  const [products, setProducts] = useState([]);
  const setTableContent = useContext(TableContent);
  function onIncrement(id, serving) {
    let index = productsAdded.findIndex(
      (item) => item.id === id && item.serving === serving
    );
    productsAdded[index].quantity++;
    storeOrder(productsAdded, route.params.data.key);
  }
  function onAddAddition(id, serving, addition) {
    let index = productsAdded.findIndex(
      (item) => item.id === id && item.serving === serving
    );
    productsAdded[index].addition = addition;
    storeOrder(productsAdded, route.params.data.key);
  }

  function onRemove(id, serving) {
    let indexAt = productsAdded.findIndex(
      (item) => item.id === id && item.serving === serving
    );
    productsAdded.splice(indexAt, 1);
    storeOrder(productsAdded, route.params.data.key);
  }
  function onDecrement(id, serving) {
    let indexAt = productsAdded.findIndex(
      (item) => item.id === id && item.serving === serving
    );
    if (productsAdded[indexAt].quantity > 1) {
      productsAdded[indexAt].quantity--;
    } else {
      productsAdded.splice(indexAt, 1);
    }
    storeOrder(productsAdded, route.params.data.key);
  }

  useEffect(() => {
    setOrderView(
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary500} />
      </View>
    );
    return onValue(
      ref(db, "/order/" + route.params.data.key),
      (querySnapShot) => {
        productsAdded = [];
        appetizerProducts = [];
        firstCourseProducts = [];
        secondCourseProducts = [];
        dessertProducts = [];
        querySnapShot.forEach((documentSnapshot) => {
          let document = [];
          document.push(documentSnapshot.val());
          document.forEach((item) => {
            productsAdded.push(item);
            if (item.serving === "appetizer") appetizerProducts.push(item);
            else if (item.serving === "mainCourse")
              firstCourseProducts.push(item);
            else if (item.serving === "secondCourse")
              secondCourseProducts.push(item);
            else dessertProducts.push(item);
          });
        });
        setProducts(productsAdded);
        setTableContent(productsAdded);
        if (
          appetizerProducts.length === 0 &&
          firstCourseProducts.length === 0 &&
          secondCourseProducts.length === 0 &&
          dessertProducts.length === 0
        )
          setOrderView(
            <View style={{ flex: 1, padding: 10 }}>
              <Text>Non ci sono ordini.</Text>
            </View>
          );
        else {
          let varView = (
            <ScrollView>
              <View key={"appetizers"}>
                {appetizerProducts.length > 0 ? (
                  <View>
                    <Text style={styles.textStyle}>Antipasti</Text>
                    <View>
                      {appetizerProducts.map((item) => (
                        <ProductListContainer
                          item={item}
                          isOrderView={false}
                          onIcrement={onIncrement}
                          onDecrement={onDecrement}
                          onRemove={onRemove}
                          onAddAddition={onAddAddition}
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
              <View key={"firstCourse"}>
                {firstCourseProducts.length > 0 ? (
                  <View>
                    <Text style={styles.textStyle}>Primi</Text>
                    <View>
                      {firstCourseProducts.map((item) => (
                        <ProductListContainer
                          item={item}
                          isOrderView={false}
                          onIcrement={onIncrement}
                          onDecrement={onDecrement}
                          onRemove={onRemove}
                          onAddAddition={onAddAddition}
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
              <View key={"secondCourse"}>
                {secondCourseProducts.length > 0 ? (
                  <View>
                    <Text style={styles.textStyle}>Secondi</Text>
                    <View>
                      {secondCourseProducts.map((item) => (
                        <ProductListContainer
                          item={item}
                          isOrderView={false}
                          onIcrement={onIncrement}
                          onDecrement={onDecrement}
                          onRemove={onRemove}
                          onAddAddition={onAddAddition}
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
              <View key={"dessert"}>
                {dessertProducts.length > 0 ? (
                  <View>
                    <Text style={styles.textStyle}>Dolci</Text>
                    <View>
                      {dessertProducts.map((item) => (
                        <ProductListContainer
                          item={item}
                          isOrderView={false}
                          onIcrement={onIncrement}
                          onDecrement={onDecrement}
                          onRemove={onRemove}
                          onAddAddition={onAddAddition}
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          );
          setOrderView(varView);
        }
      }
    );
  }, []);
  return (
    <View style={styles.container}>
      {orderView}
      <View
        style={{
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          backgroundColor: Colors.primary600,
          height: "10%",
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 2,
        }}
      >
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => {
            navigation.navigate("AddMenuItem", {
              data: route.params.data,
              products: products,
            });
            dispatch(restartAppetizer());
          }}
        />
      </View>
    </View>
  );
}

export default OrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: "static",
    margin: 16,
    bottom: 20,
    backgroundColor: Colors.primary500,
  },
  textStyle: {
    padding: 8,
  },
});
