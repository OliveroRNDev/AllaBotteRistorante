import { StyleSheet, View, Button } from "react-native";
import Colors from "../colors/Color";
import { TextInput } from "react-native-paper";
import { useState, useEffect } from "react";
import {
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";
import { storeData } from "../util/utils";
import axios from "axios";
import { useToast } from "react-native-toast-notifications";
import { BACKEND_URL } from "../util/secret-variables";

function ModifyAddProducts({
  isModify, //This tells us if it is a modify or add Modal
  item,
  setModifyItem,
  triggerVisibility, //the parent container tells this component if the modal has to be visible or not
  settleVisibility, //called to set parent container value of the modal
}) {
  const data = [
    { label: "BAR", value: "1" },
    { label: "CUCINA", value: "2" },
    { label: "PIZZERIA", value: "3" },
  ];

  const [modeIsVisible, setModeIsVisible] = useState(false);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [nameText, setName] = useState("");
  const [priceText, setPrice] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (item !== null && isModify) {
      setName(item.name);
      setPrice(item.price);
      setValue(selectValue(item.place));
    } else if (item === null) {
      setName("");
      setPrice("");
      setValue(null);
    }
    if (triggerVisibility !== null && triggerVisibility === true)
      setModeIsVisible(true);
    else setModeIsVisible(false);
  }, [triggerVisibility]);

  function selectValue(value) {
    if (value === "BAR") return "1";
    else if (value === "CUCINA") return "2";
    return "3";
  }

  function selectString(value) {
    if (value === "1") return "BAR";
    else if (value === "2") return "CUCINA";
    return "PIZZERIA";
  }

  //insert product in the database
  async function AddToDatabase() {
    //the name must have at least 5 characters
    if (value !== null && nameText.length > 4 && priceText.length > 0)
      storeData({
        name: nameText,
        price: priceText,
        place: selectString(value),
      })
        .then(() => {
          toast.show("Prodotto inserito!", {
            placement: "top",
            type: "custom_type_ok",
          });
        })
        .catch((err) => {
          toast.show("Qualcosa è andato storto, riprovare.", {
            placement: "top",
            type: "custom_type_error",
          });
        });
  }

  //update product in the database
  function ModifyItem() {
    if (checkChange(item))
      axios
        .put(BACKEND_URL + "data/" + item.key + ".json", {
          name: nameText,
          price: priceText,
          place: selectString(value),
        })
        .then(() => {
          toast.show("Prodotto Modificato!", {
            placement: "top",
            type: "custom_type_ok",
          });
        })
        .catch((err) => {
          toast.show("Qualcosa è andato storto, riprovare.", {
            placement: "top",
            type: "custom_type_error",
          });
        });
  }

  //Has there been a change?
  function checkChange() {
    if (
      item.name !== nameText ||
      item.price !== priceText ||
      value !== selectValue(item.place)
    ) {
      return true;
    }
    return false;
  }

  return (
    <Modal animationType="slide" transparent={true} visible={modeIsVisible}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPressOut={() => {
          setModeIsVisible(false);
          settleVisibility(false);
          setModifyItem(null);
        }}
      >
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <View style={styles.inputStyle}>
                <TextInput
                  label={"Nome prodotto"}
                  onChangeText={(text) => {
                    setName(text);
                  }}
                  value={nameText}
                  keyboardType="ascii-capable"
                  mode="outlined"
                />
              </View>
              <View style={styles.inputStyle}>
                <TextInput
                  label={"Prezzo"}
                  onChangeText={(text) => {
                    if (!isNaN(Number(text))) setPrice(text);
                  }}
                  value={priceText}
                  mode="outlined"
                  keyboardType="numeric"
                />
              </View>
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={data}
                search
                width={300}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={"Seleziona"}
                searchPlaceholder="Search..."
                value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={(item) => {
                  setValue(item.value);
                  setIsFocus(false);
                }}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color={isFocus ? "blue" : "black"}
                    name="Safety"
                    size={20}
                  />
                )}
              />
              <View style={styles.buttonStyle}>
                {isModify ? (
                  <Button
                    title="Modifica"
                    color={Colors.primary500}
                    onPress={ModifyItem}
                  />
                ) : (
                  <Button
                    title="Aggiungi"
                    color="red"
                    onPress={AddToDatabase}
                  />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default ModifyAddProducts;

const styles = StyleSheet.create({
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
