import { StyleSheet, View, Text } from "react-native";
import Colors from "../colors/Color";
import { FAB } from "react-native-paper";
import { useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import ProductContainer from "../components/ProductContainer";
import { ActivityIndicator } from "react-native";
import ModifyAddProducts from "../components/ModifyAddProducts";
import { useContext } from "react";
import { ProductContext } from "../context/Context";

function ProductsScreen() {
  const [modeIsVisible, setModeIsVisible] = useState(false);
  const [modifyItem, setModifyItem] = useState(null);
  const products = useContext(ProductContext);

  const renderItem = ({ item }) => {
    if (item.isDivider === undefined)
      return (
        <ProductContainer
          item={item}
          setModifyItem={setModifyItem}
          triggerVisibility={modeIsVisible}
          settleVisibility={setModeIsVisible}
        />
      );
    else if (item.isDivider !== undefined && item.isDivider === true) {
      return (
        <View style={{ margin: 8 }}>
          <Text style={{ fontWeight: "bold" }}>{item.place}</Text>
        </View>
      );
    }
  };
  const keyExtractor = (item) => {
    if (
      item.isDivider !== null &&
      item.isDivider !== undefined &&
      item.isDivider === true
    )
      return item.place;
    else return item.key;
  };

  return (
    <View style={[styles.container]}>
      {products === null ? (
        <View style={{ flex: 1 }}>
          <ActivityIndicator size={"large"} color={Colors.primary500} />
        </View>
      ) : null}
      {products !== null && products.length > 0 ? (
        <FlatList
          data={products}
          removeClippedSubviews={true}
          maxToRenderPerBatch={50}
          windowSize={11}
          initialNumToRender={products.length}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      ) : (
        <View style={{ margin: 8, flex: 1 }}>
          <Text>Non ci sono prodotti</Text>
        </View>
      )}
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
            if (modeIsVisible) setModeIsVisible(false);
            else {
              setModifyItem(null);
              setModeIsVisible(true);
            }
          }}
        />
      </View>
      <ModifyAddProducts
        item={modifyItem}
        setModifyItem={setModifyItem}
        isModify={modifyItem === null ? false : true}
        triggerVisibility={modeIsVisible}
        settleVisibility={setModeIsVisible}
      />
    </View>
  );
}

export default ProductsScreen;

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
  buttonStyle: {
    marginBottom: 10,
  },
  inputContainer: {
    flex: 1,
  },
  inputStyle: {
    width: "90%",
    marginBottom: 10,
  },
  modal: {
    width: "60%",
    backgroundColor: "white",
    alignItems: "center",
    borderRadius: 10,
    paddingTop: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    width: 200,
    marginBottom: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
