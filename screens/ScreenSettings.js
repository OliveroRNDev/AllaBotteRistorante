import { View, Text, Button, StyleSheet, Modal, Platform } from "react-native";
import { db } from "../util/firebase-config";
import { ref, onValue } from "firebase/database";
import { useEffect } from "react";
import { useState } from "react";
import { BluetoothManager } from "react-native-bluetooth-escpos-printer";
import { requestLocationPermission } from "./TablesUI";
import { FlatList } from "react-native-gesture-handler";
import Colors from "../colors/Color";
import { TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { addPrinter, updatePrinter, updateiOSPrinter } from "../util/utils";
import { ActivityIndicator } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../store/auth-context";
import { useToast } from "react-native-toast-notifications";

function ScreenSettings() {
  const [barPrinter, setBarPrinter] = useState(null);
  const [kitchenPrinter, setKitchenPrinter] = useState(null);
  const [pizzaPrinter, setPizzaPrinter] = useState(null);
  const [billPrinter, setBillPrinter] = useState(null);
  const [printersFound, setPrintersFound] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [printerId, setPrinterId] = useState(null);
  const [printers, setPrinters] = useState(null);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [isPrintersLoading, setPrintersLoading] = useState(true);
  const userCtx = useContext(AuthContext);
  const toast = useToast();

  useEffect(() => {
    if (Platform.OS === "android")
      return onValue(ref(db, "/printers"), (querySnapShot) => {
        if (querySnapShot.val() !== null)
          querySnapShot.forEach((documentSnapshot) => {
            const values = documentSnapshot.toJSON();
            setPrinterId(documentSnapshot.key);
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
              setPrinterId(documentSnapshot.key);
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
    if (printers !== null && printers !== undefined) setPrintersLoading(false);
  }, [printers]);

  return (
    <>
      {isPrintersLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={Colors.primary500} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              margin: 10,
              alignItems: "center",
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 2,
              padding: 8,
              backgroundColor: "white",
              borderRadius: 8,
            }}
          >
            <View style={{ width: "80%" }}>
              <Text>
                Stampante Cucina:{" "}
                {kitchenPrinter !== null ? kitchenPrinter : null}
              </Text>
              {Platform.OS === "android" ? (
                <Text>
                  Indirizzo Android:{" "}
                  {printers.kitchenPrinterAddress !== null
                    ? printers.kitchenPrinterAddress
                    : null}
                </Text>
              ) : (
                <Text>
                  Indirizzo iOS:{" "}
                  {printers.kitchenPrinterIdentifier !== null
                    ? printers.kitchenPrinterIdentifier
                    : null}
                </Text>
              )}
            </View>
            <View>
              <Button
                title={"Scegli"}
                onPress={() => {
                  setSelectedPrinter("kitchenPrinter");
                  setIsLoading(true);
                  setModalVisible(true);
                  if (Platform.OS === "android") {
                    const permission = requestLocationPermission();
                    if (permission) {
                      BluetoothManager.scanDevices().then(
                        (s) => {
                          var ss = JSON.parse(s); //JSON string
                          const found = ss.found.filter(
                            (item) => item.name !== undefined
                          );
                          const paired = ss.paired.filter(
                            (item) => item.name !== undefined
                          );
                          const mix = [];
                          found.forEach((element) => {
                            mix.push(element);
                          });
                          paired.forEach((element) => {
                            mix.push(element);
                          });
                          setPrintersFound(mix);
                          setIsLoading(false);
                        },
                        (error) => {
                          if (error.message === "NOT_STARTED") {
                            toast.show("Accendi il bluetooth e riprova", {
                              placement: "top",
                              type: "custom_type_error",
                            });
                            setModalVisible(false);
                          }
                        }
                      );
                    }
                  } else {
                    BluetoothManager.scanDevices().then(
                      (s) => {
                        const ss = JSON.parse(s.found);
                        const found = ss.filter(
                          (item) =>
                            item.name !== undefined && item.name.length > 0
                        );
                        setPrintersFound(found);
                        setIsLoading(false);
                      },
                      (error) => {
                        if (error.code === "BLUETOOTCH_INVALID_STATE") {
                          toast.show("Accendi il bluetooth e riprova", {
                            placement: "top",
                            type: "custom_type_error",
                          });
                          setModalVisible(false);
                        }
                      }
                    );
                  }
                }}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              margin: 10,
              alignItems: "center",
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 2,
              padding: 8,
              backgroundColor: "white",
              borderRadius: 8,
            }}
          >
            <View style={{ width: "80%" }}>
              <Text>
                Stampante Bar: {barPrinter !== null ? barPrinter : null}
              </Text>
              {Platform.OS === "android" ? (
                <Text>
                  Indirizzo Android:{" "}
                  {printers.barPrinterAddress !== null
                    ? printers.barPrinterAddress
                    : null}
                </Text>
              ) : (
                <Text>
                  Indirizzo iOS:{" "}
                  {printers.barPrinterIdentifier !== null
                    ? printers.barPrinterIdentifier
                    : null}
                </Text>
              )}
            </View>
            <View>
              <Button
                title={"Scegli"}
                onPress={() => {
                  setSelectedPrinter("barPrinter");
                  setIsLoading(true);
                  setModalVisible(true);
                  if (Platform.OS === "android") {
                    const permission = requestLocationPermission();
                    if (permission) {
                      BluetoothManager.scanDevices().then(
                        (s) => {
                          var ss = JSON.parse(s); //JSON string
                          const found = ss.found.filter(
                            (item) => item.name !== undefined
                          );
                          const paired = ss.paired.filter(
                            (item) => item.name !== undefined
                          );
                          const mix = [];
                          found.forEach((element) => {
                            mix.push(element);
                          });
                          paired.forEach((element) => {
                            mix.push(element);
                          });
                          setPrintersFound(mix);
                          setIsLoading(false);
                        },
                        (error) => {
                          if (error.message === "NOT_STARTED") {
                            toast.show("Accendi il bluetooth e riprova", {
                              placement: "top",
                              type: "custom_type_error",
                            });
                            setModalVisible(false);
                          }
                        }
                      );
                    }
                  } else {
                    BluetoothManager.scanDevices().then(
                      (s) => {
                        const ss = JSON.parse(s.found);
                        const found = ss.filter(
                          (item) =>
                            item.name !== undefined && item.name.length > 0
                        );
                        setPrintersFound(found);
                        setIsLoading(false);
                      },
                      (error) => {
                        if (error.code === "BLUETOOTCH_INVALID_STATE") {
                          toast.show("Accendi il bluetooth e riprova", {
                            placement: "top",
                            type: "custom_type_error",
                          });
                          setModalVisible(false);
                        }
                      }
                    );
                  }
                }}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              margin: 10,
              alignItems: "center",
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 2,
              padding: 8,
              backgroundColor: "white",
              borderRadius: 8,
            }}
          >
            <View style={{ width: "80%" }}>
              <Text>
                Stampante Pizzeria:{" "}
                {pizzaPrinter !== null ? pizzaPrinter : null}
              </Text>
              {Platform.OS === "android" ? (
                <Text>
                  Indirizzo Android:{" "}
                  {printers.pizzaPrinterAddress !== null
                    ? printers.pizzaPrinterAddress
                    : null}
                </Text>
              ) : (
                <Text>
                  Indirizzo iOS:{" "}
                  {printers.pizzaPrinterIdentifier !== null
                    ? printers.pizzaPrinterIdentifier
                    : null}
                </Text>
              )}
            </View>
            <View>
              <Button
                title={"Scegli"}
                onPress={() => {
                  setSelectedPrinter("pizzaPrinter");
                  setIsLoading(true);
                  setModalVisible(true);
                  if (Platform.OS === "android") {
                    const permission = requestLocationPermission();
                    if (permission) {
                      BluetoothManager.scanDevices().then(
                        (s) => {
                          var ss = JSON.parse(s); //JSON string
                          const found = ss.found.filter(
                            (item) => item.name !== undefined
                          );
                          const paired = ss.paired.filter(
                            (item) => item.name !== undefined
                          );
                          const mix = [];
                          found.forEach((element) => {
                            mix.push(element);
                          });
                          paired.forEach((element) => {
                            mix.push(element);
                          });
                          setPrintersFound(mix);
                          setIsLoading(false);
                        },
                        (error) => {
                          if (error.message === "NOT_STARTED") {
                            toast.show("Accendi il bluetooth e riprova", {
                              placement: "top",
                              type: "custom_type_error",
                            });
                            setModalVisible(false);
                          }
                        }
                      );
                    }
                  } else {
                    BluetoothManager.scanDevices().then(
                      (s) => {
                        const ss = JSON.parse(s.found);
                        const found = ss.filter(
                          (item) =>
                            item.name !== undefined && item.name.length > 0
                        );
                        setPrintersFound(found);
                        setIsLoading(false);
                      },
                      (error) => {
                        if (error.code === "BLUETOOTCH_INVALID_STATE") {
                          toast.show("Accendi il bluetooth e riprova", {
                            placement: "top",
                            type: "custom_type_error",
                          });
                          setModalVisible(false);
                        }
                      }
                    );
                  }
                }}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              margin: 10,
              alignItems: "center",
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 2,
              padding: 8,
              backgroundColor: "white",
              borderRadius: 8,
            }}
          >
            <View style={{ width: "80%" }}>
              <Text>
                Stampante Resoconto: {billPrinter !== null ? billPrinter : null}
              </Text>
              {Platform.OS === "android" ? (
                <Text>
                  Indirizzo Android:{" "}
                  {printers.billPrinterAddress !== null
                    ? printers.billPrinterAddress
                    : null}
                </Text>
              ) : (
                <Text>
                  Indirizzo iOS:{" "}
                  {printers.billPrinterIdentifier !== null
                    ? printers.billPrinterIdentifier
                    : null}
                </Text>
              )}
            </View>
            <View>
              <Button
                title={"Scegli"}
                onPress={() => {
                  setSelectedPrinter("billPrinter");
                  setIsLoading(true);
                  setModalVisible(true);
                  if (Platform.OS === "android") {
                    const permission = requestLocationPermission();
                    if (permission) {
                      BluetoothManager.scanDevices().then(
                        (s) => {
                          var ss = JSON.parse(s); //JSON string
                          const found = ss.found.filter(
                            (item) => item.name !== undefined
                          );
                          const paired = ss.paired.filter(
                            (item) => item.name !== undefined
                          );
                          const mix = [];
                          found.forEach((element) => {
                            mix.push(element);
                          });
                          paired.forEach((element) => {
                            mix.push(element);
                          });
                          setPrintersFound(mix);
                          setIsLoading(false);
                        },
                        (error) => {
                          if (error.message === "NOT_STARTED") {
                            toast.show("Accendi il bluetooth e riprova", {
                              placement: "top",
                              type: "custom_type_error",
                            });
                            setModalVisible(false);
                          }
                        }
                      );
                    }
                  } else {
                    BluetoothManager.scanDevices().then(
                      (s) => {
                        const ss = JSON.parse(s.found);
                        const found = ss.filter(
                          (item) =>
                            item.name !== undefined && item.name.length > 0
                        );
                        setPrintersFound(found);
                        setIsLoading(false);
                      },
                      (error) => {
                        if (error.code === "BLUETOOTCH_INVALID_STATE") {
                          toast.show("Accendi il bluetooth e riprova", {
                            placement: "top",
                            type: "custom_type_error",
                          });
                          setModalVisible(false);
                        }
                      }
                    );
                  }
                }}
              />
            </View>
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => {
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
                    {isLoading === false ? (
                      printersFound !== null && printersFound.length === 0 ? (
                        <Text>Non ci sono dispositivi. </Text>
                      ) : (
                        <FlatList
                          data={printersFound}
                          renderItem={({ item }) => {
                            return (
                              <TouchableWithoutFeedback onPress={() => {}}>
                                <View
                                  style={{
                                    margin: 10,
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <View style={{ margin: 8 }}>
                                    <View style={{ width: "100%" }}>
                                      <Text>{item.name}</Text>
                                    </View>
                                    <View style={{ width: "100%" }}>
                                      <Text>
                                        {item.address.length < 20
                                          ? item.address
                                          : item.address.substring(0, 20) +
                                            "..."}
                                      </Text>
                                    </View>
                                  </View>
                                  <View style={{ width: "30%" }}>
                                    <Button
                                      title="Imposta"
                                      onPress={() => {
                                        if (printerId === null) {
                                          if (
                                            selectedPrinter === "kitchenPrinter"
                                          ) {
                                            if (Platform.OS === "android")
                                              addPrinter({
                                                kitchenPrinterName: item.name,
                                                kitchenPrinterAddress:
                                                  item.address,
                                              })
                                                .then(() => {
                                                  toast.show(
                                                    "Stampante modificata!",
                                                    {
                                                      placement: "top",
                                                      type: "custom_type_ok",
                                                    }
                                                  );
                                                })
                                                .catch((err) => {
                                                  toast.show(
                                                    "Qualcosa è andato storto!Riprovare",
                                                    {
                                                      placement: "top",
                                                      type: "custom_type_error",
                                                    }
                                                  );
                                                });
                                          } else if (
                                            selectedPrinter === "barPrinter"
                                          )
                                            if (Platform.OS === "android")
                                              addPrinter({
                                                barPrinterName: item.name,
                                                barPrinterAddress: item.address,
                                              })
                                                .then(() => {
                                                  toast.show(
                                                    "Stampante modificata!",
                                                    {
                                                      placement: "top",
                                                      type: "custom_type_ok",
                                                    }
                                                  );
                                                })
                                                .catch((err) => {
                                                  toast.show(
                                                    "Qualcosa è andato storto!Riprovare",
                                                    {
                                                      placement: "top",
                                                      type: "custom_type_error",
                                                    }
                                                  );
                                                });
                                            else if (
                                              selectedPrinter === "pizzaPrinter"
                                            )
                                              if (Platform.OS === "android")
                                                addPrinter({
                                                  pizzaPrinterName: item.name,
                                                  pizzaPrinterAddress:
                                                    item.address,
                                                })
                                                  .then(() => {
                                                    toast.show(
                                                      "Stampante modificata!",
                                                      {
                                                        placement: "top",
                                                        type: "custom_type_ok",
                                                      }
                                                    );
                                                  })
                                                  .catch((err) => {
                                                    toast.show(
                                                      "Qualcosa è andato storto!Riprovare",
                                                      {
                                                        placement: "top",
                                                        type: "custom_type_error",
                                                      }
                                                    );
                                                  });
                                              else {
                                                if (Platform.OS === "android")
                                                  addPrinter({
                                                    billPrinterName: item.name,
                                                    billPrinterAddress:
                                                      item.address,
                                                  })
                                                    .then(() => {
                                                      toast.show(
                                                        "Stampante modificata!",
                                                        {
                                                          placement: "top",
                                                          type: "custom_type_ok",
                                                        }
                                                      );
                                                    })
                                                    .catch((err) => {
                                                      toast.show(
                                                        "Qualcosa è andato storto!Riprovare",
                                                        {
                                                          placement: "top",
                                                          type: "custom_type_error",
                                                        }
                                                      );
                                                    });
                                              }
                                        } else {
                                          //update
                                          const temp = printers;
                                          if (
                                            selectedPrinter === "kitchenPrinter"
                                          ) {
                                            temp.kitchenPrinterName = item.name;
                                            if (Platform.OS === "android")
                                              temp.kitchenPrinterAddress =
                                                item.address;
                                            else
                                              temp.kitchenPrinterIdentifier =
                                                item.address;
                                          } else if (
                                            selectedPrinter === "barPrinter"
                                          ) {
                                            temp.barPrinterName = item.name;
                                            if (Platform.OS === "android")
                                              temp.barPrinterAddress =
                                                item.address;
                                            else
                                              temp.barPrinterIdentifier =
                                                item.address;
                                          } else if (
                                            selectedPrinter === "pizzaPrinter"
                                          ) {
                                            temp.pizzaPrinterName = item.name;
                                            if (Platform.OS === "android")
                                              temp.pizzaPrinterAddress =
                                                item.address;
                                            else
                                              temp.pizzaPrinterIdentifier =
                                                item.address;
                                          } else {
                                            temp.billPrinterName = item.name;
                                            if (Platform.OS === "android")
                                              temp.billPrinterAddress =
                                                item.address;
                                            else
                                              temp.billPrinterIdentifier =
                                                item.address;
                                          }
                                          if (Platform.OS === "android")
                                            updatePrinter(printerId, temp)
                                              .then(() => {
                                                toast.show(
                                                  "Stampante modificata!",
                                                  {
                                                    placement: "top",
                                                    type: "custom_type_ok",
                                                  }
                                                );
                                              })
                                              .catch((err) => {
                                                toast.show(
                                                  "Qualcosa è andato storto!Riprovare",
                                                  {
                                                    placement: "top",
                                                    type: "custom_type_error",
                                                  }
                                                );
                                              });
                                          else
                                            updateiOSPrinter(printerId, temp)
                                              .then(() => {
                                                toast.show(
                                                  "Stampante modificata!",
                                                  {
                                                    placement: "top",
                                                    type: "custom_type_ok",
                                                  }
                                                );
                                              })
                                              .catch((err) => {
                                                toast.show(
                                                  "Qualcosa è andato storto!Riprovare",
                                                  {
                                                    placement: "top",
                                                    type: "custom_type_error",
                                                  }
                                                );
                                              });
                                        }
                                      }}
                                    />
                                  </View>
                                </View>
                              </TouchableWithoutFeedback>
                            );
                          }}
                        />
                      )
                    ) : (
                      <View
                        style={{
                          margin: 10,
                          height: 50,
                          alignContent: "center",
                        }}
                      >
                        <Text>Sta scannerizzando...</Text>
                      </View>
                    )}
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      )}
    </>
  );
}

export default ScreenSettings;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modal: {
    height: "30%",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    backgroundColor: "white",
    alignItems: "center",
    borderRadius: 10,
    paddingTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
