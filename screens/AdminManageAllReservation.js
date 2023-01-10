import { useEffect, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import { db } from "../util/firebase-config";
import { ref, onValue } from "firebase/database";
import { View, Text, Alert } from "react-native";
import { dateToString } from "./UserReservationUI";
import ReservationContainer from "../components/ReservationContainer";
import { Pressable } from "react-native";
import { updateReservation } from "../util/utils";
import { useToast } from "react-native-toast-notifications";

function AdminManageAllReservation() {
  const [reservationList, setReservationList] = useState([]);
  const toast = useToast();

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

  useEffect(() => {
    return onValue(ref(db, "/reservation"), (querySnapShot) => {
      let document = [];
      querySnapShot.forEach((documentSnap) => {
        let uid = documentSnap.key;
        documentSnap.forEach((documentSnapshot) => {
          const temp = documentSnapshot.val();
          const time = new Date(temp.date);
          document.push({
            status: temp.status,
            date: dateToString(time, false),
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
  }, []);
  return (
    <>
      {reservationList.length === 0 ? (
        <View style={{ padding: 8 }}>
          <Text>Non ci sono prenotazioni.</Text>
        </View>
      ) : (
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
                    //flex: 1,
                    borderColor: "black",
                    borderRadius: 8,
                    alignItems: "center",
                    //borderWidth: 1,
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
      )}
    </>
  );
}

export default AdminManageAllReservation;
