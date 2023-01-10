import { useEffect, useState, useContext } from "react";
import { FlatList } from "react-native-gesture-handler";
import { db } from "../util/firebase-config";
import { ref, onValue } from "firebase/database";
import { View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../store/auth-context";
import UserReservationUI, { dateToString } from "./UserReservationUI";
import Colors from "../colors/Color";
import ReservationContainer from "../components/ReservationContainer";
import { FAB } from "react-native-paper";
import { Modal } from "react-native";
import { TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import { useToast } from "react-native-toast-notifications";
import { ActivityIndicator } from "react-native";

function ReservationStatus() {
  const [reservationList, setReservationList] = useState(null);
  const AuthCtx = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const toast = useToast();

  useEffect(() => {
    return onValue(
      ref(db, "/reservation/" + AuthCtx.userUID),
      (querySnapShot) => {
        let document = [];
        querySnapShot.forEach((documentSnapshot) => {
          const temp = documentSnapshot.val();
          const time = new Date(temp.date);
          document.push({
            status: temp.status,
            date: dateToString(time, false),
            name: temp.name,
            number: temp.number,
            key: documentSnapshot.key,
            time: time,
          });
        });
        document.sort(function (a, b) {
          return b.time - a.time;
        });

        setReservationList(document);
      }
    );
  }, []);

  return (
    <>
      {reservationList === null ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={Colors.primary500} />
        </View>
      ) : null}
      {reservationList !== null && reservationList.length === 0 ? (
        <View style={{ flex: 1, margin: 8 }}>
          <Text>Non ci sono prenotazioni</Text>
        </View>
      ) : (
        <FlatList
          data={reservationList}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            return (
              <ReservationContainer item={item} onPress={() => {}}>
                <View
                  style={{
                    flex: 1,
                    borderColor: "black",
                    borderRadius: 8,
                    padding: 4,
                    margin: 4,
                    backgroundColor: "white",
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ width: "95%" }}>
                      <View>
                        <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                      </View>
                      <Text>{item.date}</Text>
                      <Text>{item.number} persone</Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        if (item.status === "pending") {
                          toast.show("Prenotazione in accettazione!", {
                            placement: "top",
                            type: "custom_type_pending",
                          });
                        } else if (item.status === "accepted") {
                          toast.show("Prenotazione accettata!", {
                            placement: "top",
                            type: "custom_type_ok",
                          });
                        } else {
                          toast.show("Prenotazione cancellata!", {
                            placement: "top",
                            type: "custom_type_error",
                          });
                        }
                      }}
                    >
                      <View
                        style={{
                          borderRadius: 200,
                          height: "5%",
                          backgroundColor:
                            item.status === "pending"
                              ? "yellow"
                              : item.status === "accepted"
                              ? "green"
                              : "red",
                          elevation: 8,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.5,
                          shadowRadius: 2,
                          padding: 8,
                        }}
                      ></View>
                    </Pressable>
                  </View>
                </View>
              </ReservationContainer>
            );
          }}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
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
                <UserReservationUI />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableOpacity>
      </Modal>
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
            setModalVisible(true);
          }}
        />
      </View>
    </>
  );
}

export default ReservationStatus;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modal: {
    width: 200,
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
