import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Button,
  Text,
} from "react-native";
import { ActivityIndicator, FAB, TextInput } from "react-native-paper";
import { useState, useEffect, useContext } from "react";
import Colors from "../colors/Color";
import { db } from "../util/firebase-config";
import { ref, onValue } from "firebase/database";
import { storeTable } from "../util/utils";
import { FlatList } from "react-native-gesture-handler";
import TableView from "../components/TableView";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import { LongPressContext } from "../context/Context";
import { UserContext } from "../context/Context";

function TablesScreen({ navigation }) {
  const [modeIsVisible, setModeIsVisible] = useState(false);
  const [tableName, setTableName] = useState(null);
  const [tableArray, setTables] = useState([]);
  const [tableView, setTableView] = useState(null);
  const [isError, setError] = useState(false);
  const [isDeleteMode, setDeleteMode] = useState(false);
  const [tablePressed, setTablePressed] = useState(null);
  const { goBack, setGoBack, setSignUp } = useContext(UserContext);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (goBack) setGoBack(false);
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation, goBack]);

  function AddTableToDatabase() {
    if (tableArray.filter((item) => item.name === tableName).length > 0) {
      setError(true);
    } else {
      storeTable({ name: tableName });
      setError(false);
    }
  }

  useEffect(() => {
    setTableView(
      <View style={{ flex: 1 }}>
        <ActivityIndicator size={"large"} color={Colors.primary500} />
      </View>
    );
    return onValue(ref(db, "/tables"), (querySnapShot) => {
      let tables = [];

      querySnapShot.forEach((documentSnapshot) => {
        tables.push({
          ...documentSnapshot.val(),
          key: documentSnapshot.key,
        });
      });
      tables.sort(function (a, b) {
        return Number(a.name) - Number(b.name);
      });
      setTables(tables);
      if (tables.length === 0)
        setTableView(
          <View style={{ flex: 1, margin: 8 }}>
            <Text>Non ci sono tavoli.</Text>
          </View>
        );
      else {
        let varView = (
          <FlatList
            data={tables}
            renderItem={(item) => (
              <TableView
                data={item.item}
                navigation={navigation}
                isDeleteMode={isDeleteMode}
              />
            )}
            keyExtractor={(item) => item.key}
            numColumns={4}
          />
        );
        setTableView(varView);
      }
    });
  }, []);

  return (
    <LongPressContext.Provider
      value={{ isDeleteMode, setDeleteMode, tablePressed, setTablePressed }}
    >
      <Pressable
        style={{ flex: 1 }}
        onPressOut={() => {
          if (isDeleteMode) {
            setDeleteMode(false);
          }
        }}
        onPress={() => {}}
      >
        <View style={styles.container}>
          {tableView}
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
                else setModeIsVisible(true);
              }}
            />
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modeIsVisible}
            onRequestClose={() => {
              this.visibleModal(false);
              setModeIsVisible(false);
            }}
          >
            <TouchableOpacity
              style={styles.container}
              activeOpacity={1}
              onPressOut={() => {
                setModeIsVisible(false);
              }}
            >
              <View style={styles.modalContainer}>
                <TouchableWithoutFeedback>
                  <View style={styles.modal}>
                    <View style={styles.inputStyle}>
                      <TextInput
                        label={"Nome Tavolo"}
                        onChangeText={(text) => {
                          if (text.indexOf(".") === -1 && !isNaN(Number(text)))
                            setTableName(text);
                        }}
                        value={tableName}
                        mode="outlined"
                        keyboardType="number-pad"
                        error={isError}
                      />
                    </View>
                    <View style={styles.buttonStyle}>
                      <Button
                        title="Aggiungi"
                        color={Colors.primary500}
                        onPress={AddTableToDatabase}
                      />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </Pressable>
    </LongPressContext.Provider>
  );
}

export default TablesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonStyle: {
    padding: 10,
  },
  fab: {
    position: "static",
    margin: 16,
    bottom: 20,
    backgroundColor: Colors.primary500,
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
  list: {
    justifyContent: "space-evenly",
    alignItems: "stretch",
  },
});
