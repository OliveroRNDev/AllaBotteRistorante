import { useEffect, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import { db } from "../util/firebase-config";
import { ref, onValue } from "firebase/database";
import { View, Text, Alert, StyleSheet } from "react-native";
import { dateToString } from "./UserReservationUI";
import Colors from "../colors/Color";
import ReservationContainer from "../components/ReservationContainer";
import { Pressable } from "react-native";
import { updateReservation } from "../util/utils";
import { FAB } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { dateToStringOnly } from "./UserReservationUI";
import { useToast } from "react-native-toast-notifications";

function AdminManageReservation() {
  const [reservationList, setReservationList] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const toast = useToast();

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleConfirm = (date) => {
    hideDatePicker();
    setCurrentDate(date);
  };

  useEffect(() => {
    return onValue(ref(db, "/reservation"), (querySnapShot) => {
      let document = [];
      querySnapShot.forEach((documentSnap) => {
        let uid = documentSnap.key;
        documentSnap.forEach((documentSnapshot) => {
          const temp = documentSnapshot.val();
          const time = new Date(temp.date);
          if (currentDate.toDateString() === time.toDateString())
            document.push({
              status: temp.status,
              date: dateToString(time, true),
              time: time,
              name: temp.name,
              number: temp.number,
              key: documentSnapshot.key,
              uid: uid,
            });
        });
      });
      document.sort(function (a, b) {
        return b.time - a.time;
      });
      setReservationList(document);
    });
  }, [currentDate]);

  function onPress(item) {
    if (item.status === "pending")
      Alert.alert("Prenotazione", "Vuoi accettare la prenotazione?", [
        {
          text: "Rifiuta",
          onPress: () => {
            updateReservation(item.uid, item.key, {
              status: "denied",
              name: item.name,
              number: item.number,
              date: item.time,
            });
          },
          style: "cancel",
        },
        {
          text: "Accetta",
          onPress: () => {
            updateReservation(item.uid, item.key, {
              status: "accepted",
              name: item.name,
              number: item.number,
              date: item.time,
            });
          },
          style: "default",
        },
      ]);
  }

  return (
    <>
      {reservationList.length === 0 ? (
        <View style={{ padding: 8, flex: 1 }}>
          <Text>
            Non ci sono prenotazioni per {dateToStringOnly(currentDate)}.
          </Text>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={{ padding: 8 }}>
            <Text>{dateToStringOnly(currentDate)}</Text>
          </View>
          <FlatList
            data={reservationList}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => {
              return (
                <ReservationContainer
                  item={item}
                  isAdmin={true}
                  onPress={onPress}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      borderColor: "black",
                      borderRadius: 8,
                      alignItems: "center",
                      padding: 8,
                      margin: 8,
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
                        width: "95%",
                        flex: 1,
                      }}
                    >
                      <View>
                        <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                      </View>
                      <Text>{item.date}</Text>
                      <Text>{item.number} persone</Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        if (item.status === "pending") {
                          toast.show("Prenotazione in accettazione!!", {
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
                          backgroundColor:
                            item.status === "pending"
                              ? "yellow"
                              : item.status === "accepted"
                              ? "green"
                              : "red",
                          borderRadius: 100,
                          width: 20,
                          height: 20,
                          elevation: 8,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.5,
                          shadowRadius: 2,
                        }}
                      ></View>
                    </Pressable>
                  </View>
                </ReservationContainer>
              );
            }}
          />
        </View>
      )}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
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
          icon="calendar"
          onPress={() => {
            showDatePicker();
          }}
        />
      </View>
    </>
  );
}

export default AdminManageReservation;

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
