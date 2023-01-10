import { Text } from "react-native";
import { FlatList, View } from "react-native";
import { useContext } from "react";
import Colors from "../colors/Color";
import { ProductContext } from "../context/Context";
import ProductUserContainer from "../components/ProductUserContainer";
import { ActivityIndicator } from "react-native";

function RestaurantProductsUI() {
  const productList = useContext(ProductContext);
  return (
    <>
      {productList === null ? (
        <View style={{ flex: 1 }}>
          <ActivityIndicator size={"large"} color={Colors.primary500} />
        </View>
      ) : null}
      {productList !== null && productList.length > 0 ? (
        <FlatList
          data={productList}
          renderItem={({ item }) => {
            if (item.isDivider)
              return (
                <View style={{ margin: 8 }}>
                  <Text style={{ fontWeight: "bold" }}>{item.place}</Text>
                </View>
              );
            else
              return <ProductUserContainer item={item} isSwipeable={false} />;
          }}
          keyExtractor={(item) => {
            if (item.isDivider) return item.place;
            else return item.key;
          }}
          initialNumToRender={productList.length}
          style={{}}
        />
      ) : null}
      {productList !== null && productList.length === 0 ? (
        <View style={{ margin: 8 }}>
          <Text>Non ci sono prodotti.</Text>
        </View>
      ) : null}
    </>
  );
}

export default RestaurantProductsUI;
