import { View } from "react-native";
import React, { useState } from "react";
import { Button, Text, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { TextInput } from "react-native-paper";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import { AuthContext } from "../store/auth-context";
import { useContext } from "react";
import { storeReservation } from "../util/utils";
import { Dropdown } from "react-native-element-dropdown";
import { useEffect } from "react";
import { ScrollView } from "react-native";
import { useToast } from "react-native-toast-notifications";
import Colors from "../colors/Color";
import AntDesign from "react-native-vector-icons/AntDesign";

function UserReservationUI() {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [datePicked, setDatePicked] = useState(null);
  const [name, setName] = useState("");
  const [dateObjectPicked, setDateObject] = useState(null);
  const [number, setNumber] = useState(null);
  const [phone, setPhone] = useState(null);
  const restaurantLunchTime = "12:00-15:30";
  const restaurantDinnerTime = "18:00-22:00";
  const closureDay = 3;
  const toast = useToast();
  const [isFocusHours, setIsFocusHours] = useState(false);
  const [isFocusMinutes, setIsFocusMinutes] = useState(false);

  //dropdown item hours
  const [valueHours, setValueHours] = useState(null);
  const [itemsHours, setItemsHours] = useState([]);

  //dropdown item minutes
  const [valueMinutes, setValueMinutes] = useState(null);
  const [itemsMinutes, setItemsMinutes] = useState([]);

  useEffect(() => {
    //lunch times hours
    const startLunch = new Date();
    const endLunch = new Date();
    const lunchTimes = restaurantLunchTime.split("-");
    const splitStart = lunchTimes[0].split(":");
    startLunch.setHours(splitStart[0]);
    startLunch.setMinutes(splitStart[1]);
    startLunch.setSeconds(0);
    const splitEnd = lunchTimes[1].split(":");
    endLunch.setHours(splitEnd[0]);
    endLunch.setMinutes(splitEnd[1]);
    endLunch.setSeconds(0);
    const hours = [];
    let startHour = startLunch.getHours();
    let endHour = endLunch.getHours();
    while (startHour <= endHour) {
      hours.push({ label: String(startHour), value: String(startHour) });
      startHour++;
    }
    //dinner times hours
    const startDinner = new Date();
    const endDinner = new Date();
    const dinnerTimes = restaurantDinnerTime.split("-");
    const splitStartDinner = dinnerTimes[0].split(":");
    startDinner.setHours(splitStartDinner[0]);
    startDinner.setMinutes(splitStartDinner[1]);
    startDinner.setSeconds(0);
    startDinner.setMilliseconds(0);
    const splitEndDinner = dinnerTimes[1].split(":");
    endDinner.setHours(splitEndDinner[0]);
    endDinner.setMinutes(splitEndDinner[1]);
    endDinner.setSeconds(0);
    endDinner.setMilliseconds(0);
    startHour = startDinner.getHours();
    endHour = endDinner.getHours();
    while (startHour <= endHour) {
      hours.push({ label: String(startHour), value: String(startHour) });
      startHour++;
    }
    setItemsHours(hours);
    if (valueHours === null) setValueHours(hours[0].value);
  }, []);

  useEffect(() => {
    const minutes = ["00", "15", "30", "45"];
    //lunch times hours
    const startLunch = new Date();
    const endLunch = new Date();
    const startTime = Number(restaurantDinnerTime.split("-")[0].split(":")[0]);
    let lunchTimes;
    if (valueHours < startTime) lunchTimes = restaurantLunchTime.split("-");
    else lunchTimes = restaurantDinnerTime.split("-");
    const splitStart = lunchTimes[0].split(":");
    startLunch.setHours(splitStart[0]);
    startLunch.setMinutes(splitStart[1]);
    startLunch.setSeconds(0);
    startLunch.setMilliseconds(0);
    const splitEnd = lunchTimes[1].split(":");
    endLunch.setHours(splitEnd[0]);
    endLunch.setMinutes(splitEnd[1]);
    endLunch.setSeconds(0);
    endLunch.setMilliseconds(0);
    let availableTime = new Date();
    availableTime.setHours(valueHours);
    availableTime.setMinutes(minutes[0]);
    availableTime.setSeconds(0);
    availableTime.setMilliseconds(0);
    const minute = [];
    availableTime.setHours(valueHours);
    availableTime.setSeconds(0);
    for (let i = 0; i < minutes.length; i++) {
      availableTime.setMinutes(minutes[i]);
      if (availableTime >= startLunch && availableTime <= endLunch)
        minute.push({ label: minutes[i], value: minutes[i] });
    }
    setItemsMinutes(minute);
    if (valueHours !== null && minute !== null && minute.length > 0)
      setValueMinutes(minute[0].value);
  }, [valueHours]);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    const datetime = new Date(date);
    if (closureDay !== datetime.getDay()) {
      const today = new Date();
      today.setHours(0);
      today.setMinutes(0);
      today.setMilliseconds(0);
      if (today <= datetime) {
        hideDatePicker();
        setDateObject(datetime);
        const data =
          dayToString(datetime.getDay()) +
          " " +
          datetime.getDate() +
          " " +
          monthToString(datetime.getMonth()) +
          " " +
          datetime.getFullYear();
        setDatePicked(data);
      } else {
        hideDatePicker();
        toast.show("Scegliere una data a partire da oggi.", {
          placement: "top",
          type: "custom_type_error",
        });
      }
    } else {
      hideDatePicker();
      toast.show("Questo è il giorno di chiusura del ristorante.", {
        placement: "top",
        type: "custom_type_error",
      });
    }
  };

  function validateReservation() {
    if (authCtx.userUID === null || authCtx.userUID === undefined) {
      toast.show("Eseguire il login per prenotare.", {
        placement: "top",
        type: "custom_type_error",
      });
    } else {
      const today = new Date();
      const date = dateObjectPicked;
      date.setHours(valueHours);
      date.setMinutes(valueMinutes);
      if (date !== null && date >= today) {
        if (
          name !== "" &&
          name !== undefined &&
          name !== null &&
          name.length > 3
        ) {
          if (number !== null && number !== undefined && number > 0) {
            if (!isNaN(String(phone)) && phone.length === 10) {
              const inputData = {
                date: String(date),
                status: "pending",
                name: name,
                number: number,
                phone: phone,
              };
              storeReservation(authCtx.userUID, inputData)
                .then(() => {
                  toast.show("Prenotazione andata a buon fine!", {
                    placement: "top",
                    type: "custom_type_ok",
                  });
                })
                .catch((err) => {
                  toast.show("Qualcosa è andato storto!Riprova", {
                    placement: "top",
                    type: "custom_type_error",
                  });
                });
            } else {
              toast.show(
                "Inserire un numero di telefono corretto. Deve contenere 10 cifre",
                {
                  placement: "top",
                  type: "custom_type_error",
                }
              );
            }
          } else {
            toast.show(
              "Inserire il numero di persone, deve essere maggiore di zero.",
              {
                placement: "top",
                type: "custom_type_error",
              }
            );
          }
        } else {
          toast.show("Il nome deve contenere almeno quattro caratteri.", {
            placement: "top",
            type: "custom_type_error",
          });
        }
      } else {
        toast.show("E' necessario scegliere una data valida.", {
          placement: "top",
          type: "custom_type_error",
        });
      }
    }
  }

  const authCtx = useContext(AuthContext);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 10,
      }}
    >
      <View style={{ height: 20, marginBottom: 5 }}>
        <Pressable onPress={showDatePicker}>
          <Text>
            {datePicked === null ? "Clicca per scegliere la data" : datePicked}
          </Text>
        </Pressable>
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Dropdown
          style={[styles.dropdown, isFocusHours && { borderColor: "blue" }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={itemsHours}
          width={100}
          labelField="label"
          valueField="value"
          placeholder={"Seleziona"}
          searchPlaceholder="Search..."
          value={valueHours}
          onFocus={() => setIsFocusHours(true)}
          onBlur={() => setIsFocusHours(false)}
          onChange={(item) => {
            setValueHours(item.value);
            setIsFocusHours(false);
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={styles.icon}
              color={isFocusHours ? "blue" : "black"}
              name="Safety"
              size={20}
            />
          )}
        />
        <Dropdown
          style={[styles.dropdown, isFocusMinutes && { borderColor: "blue" }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={itemsMinutes}
          width={50}
          labelField="label"
          valueField="value"
          placeholder={"Seleziona"}
          searchPlaceholder="Search..."
          value={valueMinutes}
          onFocus={() => setIsFocusMinutes(true)}
          onBlur={() => setIsFocusMinutes(false)}
          onChange={(item) => {
            setValueMinutes(item.value);
            setIsFocusMinutes(false);
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={styles.icon}
              color={isFocusMinutes ? "blue" : "black"}
              name="Safety"
              size={20}
            />
          )}
        />
      </View>
      <View style={styles.inputStyle}>
        <TextInput
          label={"Nome"}
          onChangeText={(text) => {
            setName(text);
          }}
          value={name}
          keyboardType="ascii-capable"
          mode="outlined"
        />
      </View>
      <View style={styles.inputStyle}>
        <TextInput
          label={"Telefono"}
          onChangeText={(text) => {
            setPhone(text);
          }}
          value={phone}
          keyboardType="ascii-capable"
          mode="outlined"
        />
      </View>
      <View style={styles.inputStyle}>
        <TextInput
          label={"Numero persone"}
          onChangeText={(text) => {
            setNumber(text);
          }}
          value={number}
          keyboardType="ascii-capable"
          mode="outlined"
        />
      </View>
      <View style={{ borderRadius: 20, paddingBottom: 20 }}>
        <Button title="Prenota" onPress={validateReservation} />
      </View>
    </ScrollView>
  );
}

export function monthToString(month) {
  if (!isNaN(month)) {
    if (month === 0) {
      return "Gennaio";
    }
    if (month === 1) {
      return "Febbraio";
    }
    if (month === 2) {
      return "Marzo";
    }
    if (month === 3) {
      return "Aprile";
    }
    if (month === 4) {
      return "Maggio";
    }
    if (month === 5) {
      return "Giugno";
    }
    if (month === 6) {
      return "Luglio";
    }
    if (month === 7) {
      return "Agosto";
    }
    if (month === 8) {
      return "Settembre";
    }
    if (month === 9) {
      return "Ottobre";
    }
    if (month === 10) {
      return "Novembre";
    }
    if (month === 11) {
      return "Dicembre";
    }
  }
}

export function dayToString(day) {
  if (!isNaN(day)) {
    if (day === 1) {
      return "Lunedì";
    }
    if (day === 2) {
      return "Martedì";
    }
    if (day === 3) {
      return "Mercoledì";
    }
    if (day === 4) {
      return "Giovedì";
    }
    if (day === 5) {
      return "Venerdì";
    }
    if (day === 6) {
      return "Sabato";
    }
    if (day === 0) {
      return "Domenica";
    }
  }
}

export function dateToString(datetime, isOnlyTime) {
  return isOnlyTime === false
    ? dayToString(datetime.getDay()) +
        " " +
        datetime.getDate() +
        " " +
        monthToString(datetime.getMonth()) +
        " " +
        datetime.getFullYear() +
        " alle " +
        datetime
          .toLocaleTimeString()
          .substring(0, datetime.toLocaleTimeString().length - 3)
    : "Alle ore: " +
        datetime
          .toLocaleTimeString()
          .substring(0, datetime.toLocaleTimeString().length - 3);
}

export function dateToStringOnly(datetime) {
  return (
    dayToString(datetime.getDay()) +
    " " +
    datetime.getDate() +
    " " +
    monthToString(datetime.getMonth()) +
    " " +
    datetime.getFullYear()
  );
}

export default UserReservationUI;

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
  buttonStyle: {
    marginBottom: 10,
  },
  inputContainer: {
    flex: 1,
  },
  inputStyle: {
    width: "100%",
    marginBottom: 5,
  },
  modal: {
    width: "60%",
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
    width: "50%",
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
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
