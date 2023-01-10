import { createStackNavigator } from "@react-navigation/stack";
import OrderScreen from "./OrderScreen";
import TablesScreen from "./TablesScreen";
import { useContext } from "react";
import { UserContext } from "../context/Context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "../colors/Color";
import AddMenuItemScreen from "./AddMenuItemScreen";
import { useDispatch } from "react-redux";
import { restartAppetizer } from "../redux/addOrderSlice";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import { useState, useEffect } from "react";
import { TableContent } from "../context/Context";
import { db } from "../util/firebase-config";
import { ref, onValue } from "firebase/database";
import {
  BluetoothManager,
  BluetoothEscposPrinter,
} from "react-native-bluetooth-escpos-printer";
import { useToast } from "react-native-toast-notifications";
import { AuthContext } from "../store/auth-context";

export async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location permission for bluetooth scanning",
        message: "wahtever",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}

function TablesUI() {
  const Stack = createStackNavigator();
  const { goBack, setGoBack, setSignUp } = useContext(UserContext);
  const dispatch = useDispatch();
  const [printers, setPrinters] = useState([]);
  const [tableContent, setTableContent] = useState();
  const userCtx = useContext(AuthContext);

  //printers
  const [barPrinter, setBarPrinter] = useState(null);
  const [kitchenPrinter, setKitchenPrinter] = useState(null);
  const [pizzaPrinter, setPizzaPrinter] = useState(null);
  const [billPrinter, setBillPrinter] = useState(null);

  const toast = useToast();

  //android users have the printers stored globally in the database because in android you can access the MAC address
  //in iOS every device when connecting to bluetooth has a unique identifier so it needs to be stored in the user data
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

  useEffect(() => {
    if (Platform.OS === "android") requestLocationPermission();
  }, []);

  function printBill() {
    Alert.alert("Stampa resoconto tavolo", "Sei sicuro di farlo?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => {
          if (
            tableContent !== null &&
            tableContent !== undefined &&
            tableContent.length > 0
          ) {
            if (Platform.OS === "android") {
              const permission = requestLocationPermission();
              if (permission) {
                if (
                  printers.billPrinterAddress !== null &&
                  printers.billPrinterAddress !== undefined
                )
                  BluetoothManager.connect(printers.billPrinterAddress).then(
                    (s) => {
                      //success here
                      tableContent.sort(function (a, b) {
                        return a.serving.localeCompare(b.serving);
                      });
                      let productsPrint = "";
                      let maxLength = 0;
                      let maxLengthSecond = 0;
                      tableContent.forEach((element) => {
                        if (element.name.length > maxLength)
                          maxLength = element.name.length;
                        if (element.price.length > maxLengthSecond)
                          maxLengthSecond = element.price.length;
                      });
                      productsPrint +=
                        "Prodotto" +
                        Array(maxLength - "Prodotto".length + 3).join(" ") +
                        "€" +
                        Array(maxLengthSecond - "€".length + 3).join(" ") +
                        "Quantita'\n";
                      let place = "";
                      let previousPlace = "";
                      let sum = 0;
                      tableContent.forEach((element) => {
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
                          element.price +
                          Array(
                            maxLengthSecond - element.price.length + 3
                          ).join(" ") +
                          element.quantity +
                          "\n";
                        if (
                          element.addition !== null &&
                          element.addition !== undefined &&
                          element.addition !== ""
                        )
                          productsPrint += element.addition + "\n";
                      });
                      productsPrint += "Totale: " + sum + "€";
                      BluetoothEscposPrinter.printText(
                        productsPrint + "\n\n\n\n",
                        { encoding: "Cp1252", codepage: 32 }
                      ).then(() => {
                        BluetoothManager.disconnect(
                          printers.billPrinterAddress
                        ).then(
                          (s) => {
                            //success here
                          },
                          (err) => {
                            //error here
                          }
                        );
                      });
                    },
                    (err) => {
                      //error here
                    }
                  );
                else {
                  toast.show("Non hai associato una stampante!", {
                    placement: "top",
                    type: "custom_type_error",
                  });
                }
              }
            } else {
              if (
                printers.billPrinterIdentifier !== null &&
                printers.billPrinterIdentifier !== undefined
              )
                BluetoothManager.connect(printers.billPrinterIdentifier).then(
                  (s) => {
                    //success here
                    tableContent.sort(function (a, b) {
                      return a.serving.localeCompare(b.serving);
                    });
                    let productsPrint = "";
                    let maxLength = 0;
                    let maxLengthSecond = 0;
                    tableContent.forEach((element) => {
                      if (element.name.length > maxLength)
                        maxLength = element.name.length;
                      if (element.price.length > maxLengthSecond)
                        maxLengthSecond = element.price.length;
                    });
                    productsPrint +=
                      "Prodotto" +
                      Array(maxLength - "Prodotto".length + 3).join(" ") +
                      "€" +
                      Array(maxLengthSecond - "€".length + 3).join(" ") +
                      "Quantita'\n";
                    let place = "";
                    let previousPlace = "";
                    let sum = 0;
                    tableContent.forEach((element) => {
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
                        element.price +
                        Array(maxLengthSecond - element.price.length + 3).join(
                          " "
                        ) +
                        element.quantity +
                        "\n";
                      if (
                        element.addition !== null &&
                        element.addition !== undefined &&
                        element.addition !== ""
                      )
                        productsPrint += element.addition + "\n";
                    });
                    productsPrint += "Totale: " + sum + "€";
                    //cart
                    //const cart=tableContent;
                    BluetoothEscposPrinter.printText(
                      productsPrint + "\n\n\n\n",
                      {}
                    ).then(() => {});
                  },
                  (err) => {
                    //error here
                  }
                );
              else {
                toast.show("Non hai associato una stampante!", {
                  placement: "top",
                  type: "custom_type_error",
                });
              }
            }
          } else {
            toast.show("Non ci sono prodotti nel tavolo!", {
              placement: "top",
              type: "custom_type_error",
            });
          }
        },
      },
    ]);
  }

  return (
    <TableContent.Provider value={setTableContent}>
      <Stack.Navigator
        screenOptions={({ route, navigation }) => ({
          headerShown: route.name !== "Tables" ? true : false,
          headerStyle: {
            backgroundColor: Colors.primary500,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitle:
            route.name !== "Tables"
              ? "Tavolo " + route.params.data.name
              : "Tavoli",
          headerLeft: () => {
            if (route.name === "Orders")
              return (
                <Ionicons
                  name="ios-print"
                  size={32}
                  color="black"
                  style={{ padding: 8 }}
                  onPress={() => {
                    printBill();
                  }}
                />
              );
            else return null;
          },
          headerRight: () => {
            return (
              <Ionicons
                name="arrow-back"
                size={32}
                color="black"
                onPress={() => {
                  navigation.goBack();
                  if (route.name === "Orders") setGoBack(false);
                  dispatch(restartAppetizer());
                }}
              />
            );
          },
        })}
      >
        <Stack.Screen name="Tables" component={TablesScreen} />
        <Stack.Screen name="Orders" component={OrderScreen} />
        <Stack.Screen name="AddMenuItem" component={AddMenuItemScreen} />
      </Stack.Navigator>
    </TableContent.Provider>
  );
}

export default TablesUI;
