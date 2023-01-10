import { View, Text, StyleSheet, Button, TextInput } from "react-native";
import Colors from "../colors/Color";
import Swipeout from "react-native-swipeout";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  incrementAppetizer,
  decrementAppetizer,
  removeAppetizer,
  addToAppetizer,
  addAddition,
} from "../redux/addOrderSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import {
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import TextInputPaper from "./TextInputPaper";

function ProductListContainer({
  item,
  serving,
  isOrderView,
  onIcrement,
  onDecrement,
  onRemove,
  isSwipeable,
  onAddAddition,
}) {
  const [value, setValue] = useState("0");
  const appetizers = useSelector((state) => state.appetizers);
  const dispatch = useDispatch();
  const [isModalVisible, setModalVisible] = useState(false);
  const [addition, setAddition] = useState("");
  const [actualAddition, setActualAddition] = useState(null);

  useEffect(() => {
    let present = appetizers.filter(
      (itemCart) => item.key === itemCart.id && serving === itemCart.serving
    );
    if (present !== null && present.length === 1) {
      setValue(String(present[0].quantity));
    } else setValue("0");
  }, [serving]);

  let swipeBtns = [
    {
      backgroundColor: "white",
      onPress: () => onRemove(item.id, item.serving),
      component: <Ionicons name="ios-trash" size={32} color="red" />,
    },
  ];

  useEffect(() => {
    if (item.addition !== null) setAddition(item.addition);
  }, []);

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
          <Ionicons
            name="add-circle"
            size={32}
            disabled={isOrderView === false ? false : Number(value) === 0}
            color={Colors.primary500}
            onPress={() => {
              //open a modal
              setModalVisible(true);
            }}
          />
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => {
              this.visibleModal(false);
              setModalVisible(false);
            }}
          >
            <TouchableOpacity
              style={styles.container}
              activeOpacity={1}
              onPressOut={() => {
                setModalVisible(false);
              }}
            >
              <View style={styles.modalContainer}>
                <TouchableWithoutFeedback>
                  <View style={styles.modal}>
                    <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                    <View style={styles.inputStyle}>
                      <TextInputPaper
                        label={"Aggiunte"}
                        value={addition}
                        keyboardType="ascii-capable"
                        mode="outlined"
                        setValue={setAddition}
                      />
                    </View>
                    <View style={styles.buttonStyle}>
                      <Button
                        title="Modifica"
                        color={Colors.primary500}
                        onPress={() => {
                          if (addition != null && addition.length > 3) {
                            if (isOrderView === null || isOrderView === true) {
                              dispatch(
                                addAddition({
                                  id: item.key,
                                  serving: serving,
                                  addition: addition,
                                })
                              );
                              setActualAddition(addition);
                            } else {
                              onAddAddition(item.id, item.serving, addition);
                            }
                          }
                        }}
                      />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableOpacity>
          </Modal>
          <View style={styles.insideView}>
            <Text style={styles.nameStyle}>{item.name}</Text>
            <Text style={styles.priceStyle}>{"\u20AC" + item.price}</Text>
            {isOrderView === false && item.addition != null ? (
              <Text>{item.addition}</Text>
            ) : null}
            {(isOrderView !== null || isOrderView === true) &&
            actualAddition != null ? (
              <Text>{actualAddition}</Text>
            ) : null}
          </View>
          {isOrderView === null || isOrderView === true ? (
            <View style={styles.modifyView}>
              <Button
                title="+"
                onPress={() => {
                  if (Number(value) < 99) {
                    if (Number(value) === 0) {
                      dispatch(
                        addToAppetizer({
                          id: item.key,
                          name: item.name,
                          price: item.price,
                          place: item.place,
                          serving: serving,
                        })
                      );
                      setValue(String(Number(value) + 1));
                    } else {
                      setValue(String(Number(value) + 1));
                      dispatch(
                        incrementAppetizer({ id: item.key, serving: serving })
                      );
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
                    dispatch(
                      decrementAppetizer({ id: item.key, serving: serving })
                    );
                  } else if (Number(value) === 1) {
                    setValue("0");
                    dispatch(
                      removeAppetizer({ id: item.key, serving: serving })
                    );
                  }
                }}
              />
            </View>
          ) : (
            <View style={styles.modifyView}>
              <Button
                title="+"
                onPress={() => {
                  onIcrement(item.id, item.serving);
                }}
              />
              <TextInput value={String(item.quantity)} textAlign="center" />
              <Button
                title="-"
                onPress={() => {
                  onDecrement(item.id, item.serving);
                }}
              />
            </View>
          )}
        </View>
      </Swipeout>
    </View>
  );
}

export default ProductListContainer;

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
    alignItems: "center",
  },
  modifyView: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameStyle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  priceStyle: {
    fontSize: 12,
  },
  container: {
    flex: 1,
  },
  buttonStyle: {
    marginBottom: 10,
  },
  inputStyle: {
    width: "90%",
    marginBottom: 10,
  },
  modal: {
    width: "60%",
    borderColor: "black",
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
});
