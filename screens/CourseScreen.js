import { FlatList, View, Text, Button } from "react-native";
import { useContext, useRef } from "react";
import { ProductContext } from "../context/Context";
import ProductListContainer from "../components/ProductListContainer";
import { useState } from "react";
import { useEffect } from "react";

function CourseScreen({ course }) {
  const productList = useContext(ProductContext);
  const flatlistRef = useRef();
  const [pizzaIndex, setPizzaIndex] = useState(-1);
  const [kitchenIndex, setKitchenIndex] = useState(-1);
  const [barIndex, setBarIndex] = useState(-1);

  useEffect(() => {
    let index = 0;
    productList.forEach((element) => {
      if (element.isDivider && element.place === "CUCINA") {
        setKitchenIndex(index);
      } else if (element.isDivider && element.place === "PIZZERIA") {
        setPizzaIndex(index);
      } else if (element.isDivider && element.place === "BAR") {
        setBarIndex(index);
      }
      index++;
    });
    console.log();
  }, [productList]);

  const renderItem = (item) => {
    if (
      item.isDivider !== null &&
      item.isDivider !== undefined &&
      item.isDivider
    )
      return (
        <View style={{ margin: 8 }}>
          <Text style={{ fontWeight: "bold" }}>{item.place}</Text>
        </View>
      );
    else
      return (
        <View>
          <ProductListContainer
            item={item}
            serving={course}
            isOrderView={true}
            isSwipeable={false}
          />
        </View>
      );
  };
  const keyExtractor = (item) => {
    if (
      item.isDivider !== null &&
      item.isDivider !== undefined &&
      item.isDivider
    )
      return item.place;
    else return item.key + item.serving;
  };

  const scrollToIndex = (place) => {
    const x =
      place === "BAR"
        ? barIndex
        : place === "CUCINA"
        ? kitchenIndex
        : pizzaIndex;
    if (x > 0)
      flatlistRef.current?.scrollToIndex({
        index: x,
        animated: true,
      });
    else
      flatlistRef.current?.scrollToIndex({
        index: x,
        animated: true,
      });
  };

  return (
    <>
      {productList.length > 0 ? (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              margin: 8,
            }}
          >
            <Button
              title="Bar"
              disabled={barIndex < 0}
              onPress={() => {
                scrollToIndex("BAR");
              }}
            />
            <Button
              title="Cucina"
              disabled={kitchenIndex < 0}
              onPress={() => {
                scrollToIndex("CUCINA");
              }}
            />
            <Button
              title="Pizzeria"
              disabled={pizzaIndex < 0}
              onPress={() => {
                scrollToIndex("PIZZERIA");
              }}
            />
          </View>
          <FlatList
            data={productList}
            renderItem={({ item }) => renderItem(item)}
            keyExtractor={(item) => keyExtractor(item)}
            ref={flatlistRef}
            initialNumToRender={productList.length}
            onScrollToIndexFailed={(error) => {
              console.log(error);
            }}
            onEndReachedThreshold={1}
          />
        </>
      ) : (
        <View style={{ margin: 8, flex: 1 }}>
          <Text>Non ci sono prodotti.</Text>
        </View>
      )}
    </>
  );
}

export default CourseScreen;
