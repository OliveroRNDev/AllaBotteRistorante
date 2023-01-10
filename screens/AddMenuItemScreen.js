import { Platform, StyleSheet, Text, View } from "react-native";
import { FAB } from "react-native-paper";
import Colors from "../colors/Color";
import { useState, useEffect, useContext } from "react";
import { db } from "../util/firebase-config";
import { ref, onValue } from "firebase/database";
import { ProductContext } from "../context/Context";
import CourseScreen from "./CourseScreen";
import { storeOrder } from "../util/utils";
import { useSelector } from "react-redux";
import {
  BluetoothManager,
  BluetoothEscposPrinter,
} from "react-native-bluetooth-escpos-printer";
import { requestLocationPermission } from "./TablesUI";
import { ActivityIndicator } from "react-native";
import { useToast } from "react-native-toast-notifications";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import { Alert } from "react-native";
import { AuthContext } from "../store/auth-context";

function AddMenuItemScreen({ route, navigation }) {
  const appetizers = useSelector((state) => state.appetizers);
  const productList = useContext(ProductContext);
  const [printers, setPrinters] = useState([]);

  //printers
  const [barPrinter, setBarPrinter] = useState(null);
  const [kitchenPrinter, setKitchenPrinter] = useState(null);
  const [pizzaPrinter, setPizzaPrinter] = useState(null);
  const [billPrinter, setBillPrinter] = useState(null);
  const [course, setCourse] = useState("appetizer");
  const userCtx = useContext(AuthContext);

  const toast = useToast();

  function printOrderReview(cart) {
    let order = "";
    let size = 1;
    let prev = null;
    cart.forEach((element) => {
      if (prev === null || prev !== element.serving) {
        order +=
          (element.serving === "appetizer"
            ? "Antipasti"
            : element.serving === "mainCourse"
            ? "Primi"
            : element.serving === "secondCourse"
            ? "Secondi"
            : "Dolci") + "\n";
        prev = element.serving;
      }
      order = order + element.name + " x " + element.quantity;
      if (size < cart.length) order += "\n";
      size++;
    });
    return order;
  }

  useEffect(() => {
    if (Platform.OS === "android")
      return onValue(ref(db, "/printers"), (querySnapShot) => {
        if (querySnapShot.val() !== null)
          querySnapShot.forEach((documentSnapshot) => {
            const values = documentSnapshot.toJSON();
            if (values.kitchenPrinterName !== null)
              setKitchenPrinter(values.kitchenPrinterName);
            if (values.barPrinterName !== null)
              setBarPrinter(values.barPrinterName);
            if (values.pizzaPrinterName !== null)
              setPizzaPrinter(values.pizzaPrinterName);
            if (values.billPrinterName !== null)
              setBillPrinter(values.billPrinterName);
            setPrinters(values);
          });
        else {
          setPrinters([]);
        }
      });
    else {
      return onValue(ref(db, "/user"), (querySnapShot) => {
        if (querySnapShot.val() !== null)
          querySnapShot.forEach((documentSnapshot) => {
            if (documentSnapshot.val().uid === userCtx.userUID) {
              const values = documentSnapshot.toJSON();
              if (values.kitchenPrinterName !== null)
                setKitchenPrinter(values.kitchenPrinterName);
              if (values.barPrinterName !== null)
                setBarPrinter(values.barPrinterName);
              if (values.pizzaPrinterName !== null)
                setPizzaPrinter(values.pizzaPrinterName);
              if (values.billPrinterName !== null)
                setBillPrinter(values.billPrinterName);
              setPrinters(values);
            }
          });
        else {
          setPrinters([]);
        }
      });
    }
  }, [userCtx.userUID]);

  async function printOrder() {
    let hasFailed = false;
    //PIZZERIA
    if (Platform.OS === "android") {
      const permission = requestLocationPermission();
      const temp = appetizers;
      let tempFilt = temp.filter((item) => item.place === "PIZZERIA");
      if (tempFilt.length > 0) {
        if (permission) {
          if (
            printers.pizzaPrinterAddress !== null &&
            printers.pizzaPrinterAddress !== undefined
          )
            await BluetoothManager.connect(printers.pizzaPrinterAddress).then(
              async (s) => {
                await connectPrint("PIZZERIA", printers.pizzaPrinterAddress);
              },
              (err) => {
                //error here
              }
            );
          else {
            hasFailed = true;
            toast.show("Non hai associato una stampante per la pizzeria!", {
              placement: "top",
              type: "custom_type_error",
            });
          }
        }
      }
    } else {
      const temp = appetizers;
      let tempFilt = temp.filter((item) => item.place === "PIZZERIA");
      if (tempFilt.length > 0) {
        if (
          printers.pizzaPrinterIdentifier !== null &&
          printers.pizzaPrinterIdentifier !== undefined
        )
          await BluetoothManager.connect(printers.pizzaPrinterIdentifier).then(
            async (s) => {
              await connectPrint("PIZZERIA", printers.pizzaPrinterIdentifier);
            },
            (err) => {
              //error here
            }
          );
        else {
          hasFailed = true;
          toast.show("Non hai associato una stampante per la pizzeria!", {
            placement: "top",
            type: "custom_type_error",
          });
        }
      }
    }
    //CUCINA

    if (Platform.OS === "android") {
      const permission = requestLocationPermission();
      const temp = appetizers;
      let tempFilt = temp.filter((item) => item.place === "CUCINA");
      if (tempFilt.length > 0) {
        if (permission) {
          if (
            printers.kitchenPrinterAddress !== null &&
            printers.kitchenPrinterAddress !== undefined
          )
            await BluetoothManager.connect(printers.kitchenPrinterAddress).then(
              async (s) => {
                await connectPrint("CUCINA", printers.kitchenPrinterAddress);
              },
              (err) => {
                //error here
              }
            );
          else {
            hasFailed = true;
            toast.show("Non hai associato una stampante per la cucina!", {
              placement: "top",
              type: "custom_type_error",
            });
          }
        }
      }
    } else {
      const temp = appetizers;
      let tempFilt = temp.filter((item) => item.place === "CUCINA");
      if (tempFilt.length > 0) {
        if (
          printers.kitchenPrinterIdentifier !== null &&
          printers.kitchenPrinterIdentifier !== undefined
        )
          await BluetoothManager.connect(
            printers.kitchenPrinterIdentifier
          ).then(
            async (s) => {
              await connectPrint("CUCINA", printers.kitchenPrinterIdentifier);
            },
            (err) => {
              //error here
            }
          );
        else {
          hasFailed = true;
          toast.show("Non hai associato una stampante per la cucina!", {
            placement: "top",
            type: "custom_type_error",
          });
        }
      }
    }
    //BAR
    if (Platform.OS === "android") {
      const permission = requestLocationPermission();
      const temp = appetizers;
      let tempFilt = temp.filter((item) => item.place === "BAR");
      if (tempFilt.length > 0) {
        if (permission) {
          if (
            printers.barPrinterAddress !== null &&
            printers.barPrinterAddress !== undefined
          )
            await BluetoothManager.connect(printers.barPrinterAddress).then(
              async (s) => {
                await connectPrint("BAR", printers.barPrinterAddress);
              },
              (err) => {
                //error here
              }
            );
          else {
            hasFailed = true;
            toast.show("Non hai associato una stampante per il bar!", {
              placement: "top",
              type: "custom_type_error",
            });
          }
        }
      }
    } else {
      const temp = appetizers;
      let tempFilt = temp.filter((item) => item.place === "BAR");
      if (tempFilt.length > 0) {
        if (
          printers.barPrinterIdentifier !== null &&
          printers.barPrinterIdentifier !== undefined
        )
          await BluetoothManager.connect(printers.barPrinterIdentifier).then(
            async (s) => {
              await connectPrint("BAR", printers.barPrinterIdentifier);
            },
            (err) => {
              //error here
            }
          );
        else {
          hasFailed = true;
          toast.show("Non hai associato una stampante per il bar!", {
            placement: "top",
            type: "custom_type_error",
          });
        }
      }
    }

    let varMod = route.params.products.concat(appetizers);
    for (var i = 0; i < varMod.length; ++i) {
      for (var j = i + 1; j < varMod.length; ++j) {
        if (
          varMod[i].id === varMod[j].id &&
          varMod[i].serving === varMod[j].serving
        ) {
          varMod[i].quantity += varMod[j].quantity;
          if (varMod[j].addition !== null)
            varMod[i].addition = varMod[j].addition;
          varMod.splice(j--, 1);
        }
      }
    }
    if (!hasFailed) {
      storeOrder(varMod, route.params.data.key);
      navigation.goBack();
    }
  }

  async function connectPrint(printerPlace, address) {
    let temp = appetizers;
    let tempFilt = temp.filter((item) => item.place === printerPlace);
    tempFilt.sort(function (a, b) {
      return a.serving.localeCompare(b.serving);
    });
    if (tempFilt.length > 0) {
      let productsPrint = "";
      let maxLength = 0;
      let maxLengthSecond = 0;
      tempFilt.forEach((element) => {
        if (element.name.length > maxLength) maxLength = element.name.length;
        if (element.price.length > maxLengthSecond)
          maxLengthSecond = element.price.length;
      });
      productsPrint += printerPlace + "\n";
      productsPrint +=
        "Prodotto" +
        Array(maxLength - "Prodotto".length + 3).join(" ") +
        "Quantita'\n";
      let place = "";
      let previousPlace = "";
      let sum = 0;
      tempFilt.forEach((element) => {
        sum += element.price * element.quantity;
        place = element.serving;
        if (place !== previousPlace) {
          previousPlace = place;
          productsPrint +=
            (place === "appetizer"
              ? "Antipasti"
              : place === "mainCourse"
              ? "Primi"
              : place === "secondCourse"
              ? "Secondi"
              : "Dolci") + "\n";
        }
        productsPrint +=
          element.name +
          Array(maxLength - element.name.length + 3).join(" ") +
          element.quantity +
          "\n";
        if (
          element.addition !== null &&
          element.addition !== undefined &&
          element.addition !== ""
        )
          productsPrint += element.addition + "\n";
      });
      await BluetoothEscposPrinter.printText(productsPrint + "\n\n\n\n", {
        encoding: "Cp1252",
        codepage: 32,
      }).then(async () => {});
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {productList === null ? (
        <View style={{}}>
          <ActivityIndicator size={"large"} color={Colors.primary500} />
        </View>
      ) : (
        <View style={styles.container}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              height: "10%",
            }}
          >
            <Pressable
              style={{ flex: 1, width: "25%" }}
              onPress={() => {
                setCourse("appetizer");
              }}
            >
              <View
                style={{
                  //borderBottomWidth: 1,
                  borderRightWidth: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: 8,
                  borderBottomWidth: 1,
                  flex: 1,
                  backgroundColor:
                    course === "appetizer" ? Colors.primary600 : "white",
                }}
              >
                <View style={{ padding: 8, margin: 8 }}>
                  <Text>Antipasti</Text>
                </View>
              </View>
            </Pressable>
            <Pressable
              style={{ flex: 1, width: "25%" }}
              onPress={() => {
                setCourse("mainCourse");
              }}
            >
              <View
                style={{
                  borderRightWidth: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: 8,
                  borderBottomWidth: 1,
                  flex: 1,
                  backgroundColor:
                    course === "mainCourse" ? Colors.primary600 : "white",
                }}
              >
                <View style={{ padding: 8, margin: 8 }}>
                  <Text>Primi</Text>
                </View>
              </View>
            </Pressable>
            <Pressable
              style={{
                width: "25%",
                flex: 1,
              }}
              onPress={() => {
                setCourse("secondCourse");
              }}
            >
              <View
                style={{
                  borderRightWidth: 1,
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: 8,
                  borderBottomWidth: 1,
                  backgroundColor:
                    course === "secondCourse" ? Colors.primary600 : "white",
                }}
              >
                <View style={{ padding: 8, margin: 8 }}>
                  <Text>Secondi</Text>
                </View>
              </View>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                width: "25%",
              }}
              onPress={() => {
                setCourse("dessert");
              }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: 8,
                  borderBottomWidth: 1,
                  backgroundColor:
                    course === "dessert" ? Colors.primary600 : "white",
                }}
              >
                <View style={{ padding: 8, margin: 8 }}>
                  <Text>Dolci</Text>
                </View>
              </View>
            </Pressable>
          </View>
          <CourseScreen course={course} />
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
              containerStyle={{ left: "50%" }}
              position="bottomRight"
              style={styles.fab}
              icon="check"
              onPress={async () => {
                if (appetizers.length > 0) {
                  let temp = appetizers.slice();
                  temp.sort(function (a, b) {
                    return a.serving.localeCompare(b.serving) > 0;
                  });
                  Alert.alert(
                    "Invia ordine",
                    "Sei sicuro di voler inviare l'ordine?\n" +
                      printOrderReview(temp),
                    [
                      {
                        text: "Annulla",
                        onPress: () => {},
                        style: "cancel",
                      },
                      {
                        text: "Accetta",
                        onPress: async () => {
                          await printOrder();
                        },
                        style: "default",
                      },
                    ]
                  );
                } else
                  toast.show("Non hai inserito nessun prodotto!", {
                    placement: "top",
                    type: "custom_type_error",
                  });
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

export default AddMenuItemScreen;

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
});
