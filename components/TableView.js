import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "../colors/Color";

import { useContext, useEffect } from "react";
import { LongPressContext, UserContext } from "../context/Context";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { deleteTable } from "../util/utils";
import { Alert } from "react-native";

function TableView({ data, navigation }) {
  const { goBack, setGoBack, setSignUp } = useContext(UserContext);
  const { isDeleteMode, setDeleteMode, tablePressed, setTablePressed } =
    useContext(LongPressContext);
  const [varView, setVarView] = useState(null);
  const [pressedView, setPressedView] = useState(null);

  useEffect(() => {
    if (isDeleteMode && tablePressed === data.key) {
      setVarView(
        <TouchableOpacity
          style={{
            width: 20,
            height: 20,
            borderRadius: 25,
            backgroundColor: "#72777c",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            right: 20,
            top: 5,
            zIndex: 100,
          }}
          onPress={() => {
            Alert.alert("Tavolo" + data.name, "Vuoi cancellare il tavolo?", [
              {
                text: "Cancel",
                onPress: () => {},
                style: "cancel",
              },
              {
                text: "OK",
                onPress: () => {
                  deleteTable(data.key);
                  setDeleteMode(false);
                  setTablePressed(null);
                },
              },
            ]);
          }}
        >
          <Ionicons name="md-close" size={15} />
        </TouchableOpacity>
      );
      //setOutsidePress(true);
    } else {
      setVarView(null);
    }
  }, [isDeleteMode, tablePressed]);
  useEffect(() => {
    if (isDeleteMode) {
      setPressedView(
        <Pressable pointerEvents="none">
          <View style={styles.innerContainer} key={data.key}>
            <Text style={{ alignSelf: "center" }}>{data.name}</Text>
          </View>
        </Pressable>
      );
    } else {
      setPressedView(
        <Pressable
          onPress={() => {
            navigation.navigate("Orders", { data: data });
            setGoBack(true);
          }}
          onLongPress={() => {
            setDeleteMode(true);
            setTablePressed(data.key);
          }}
        >
          <View style={styles.innerContainer} key={data.key}>
            <Text style={{ alignSelf: "center" }}>{data.name}</Text>
          </View>
        </Pressable>
      );
      setVarView(null);
    }
  }, [isDeleteMode, tablePressed]);

  return (
    <TouchableOpacity style={styles.outerContainer}>
      {varView}
      {pressedView}
    </TouchableOpacity>
  );
}

export default TableView;

const styles = StyleSheet.create({
  innerContainer: {
    backgroundColor: Colors.primary600,
    borderRadius: 200,
    padding: 10,
    margin: 10,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  outerContainer: {
    width: "25%",
    justifyContent: "center",
    alignItems: "center",
  },
});
