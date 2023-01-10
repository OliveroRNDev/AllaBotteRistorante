import { View, Text, Button, StyleSheet } from "react-native";
import { useContext, useEffect, useState } from "react";
import { db } from "../util/firebase-config";
import { ref, onValue } from "firebase/database";
import { FlatList } from "react-native";
import { AuthContext } from "../store/auth-context";
import { updateUserData } from "../util/utils";
import { ActivityIndicator } from "react-native";
import Colors from "../colors/Color";

function UserManageScreen() {
  const [listUsers, setListUsers] = useState(null);
  const authCtx = useContext(AuthContext);

  useEffect(() => {
    return onValue(ref(db, "/userSensitive"), (querySnapShot) => {
      let users = [];

      querySnapShot.forEach((documentSnapshot) => {
        const userList = documentSnapshot.toJSON();
        const user = {
          uid: userList.uid,
          email: userList.email,
          userType: userList.userType,
          id: documentSnapshot.key,
        };
        if (authCtx.userUID !== user.uid)
          users.push({
            ...user,
          });
      });
      setListUsers(users);
    });
  }, []);
  return (
    <>
      {listUsers === null ? (
        <View style={{ flex: 1 }}>
          <ActivityIndicator size={"large"} color={Colors.primary500} />
        </View>
      ) : null}
      {listUsers !== null && listUsers.length === 0 ? (
        <View style={{ flex: 1, margin: 8 }}>
          <Text>Non ci sono utenti.</Text>
        </View>
      ) : (
        <FlatList
          renderItem={(item) => {
            return (
              <View
                style={{
                  flex: 1,
                  margin: 8,
                  padding: 8,
                  elevation: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.5,
                  shadowRadius: 2,
                  backgroundColor: "white",
                  borderRadius: 8,
                  flexDirection: "row",
                }}
              >
                <View style={styles.container}>
                  <View style={{ width: "60%" }}>
                    <Text>User: {item.item.email.split("@")[0]}</Text>
                    <Text>Dominio: {item.item.email.split("@")[1]}</Text>
                  </View>
                  <View style={{ width: "15%", alignItems: "center" }}>
                    <Text>
                      {item.item.userType === "user" ? "Utente" : "Admin"}
                    </Text>
                  </View>
                  <View style={{ width: "25%" }}>
                    <Button
                      title="Cambia"
                      onPress={() => {
                        const userInfo = {
                          uid: item.item.uid,
                          userType:
                            item.item.userType === "admin" ? "user" : "admin",
                        };
                        const userSensitiveInfo = {
                          uid: item.item.uid,
                          email: item.item.email,
                          userType:
                            item.item.userType === "admin" ? "user" : "admin",
                        };
                        updateUserData(
                          userInfo,
                          userSensitiveInfo,
                          item.item.id
                        );
                      }}
                    />
                  </View>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.listContainer}
          data={listUsers}
          style={styles.listContainer}
          keyExtractor={(item) => {
            return item.uid;
          }}
        />
      )}
    </>
  );
}

export default UserManageScreen;

const styles = StyleSheet.create({
  listContainer: {},
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 8,
  },
});
