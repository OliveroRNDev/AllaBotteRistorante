import { useState } from "react";
import { useEffect } from "react";
import { View, Text, Alert } from "react-native";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import { updateCartOrder } from "../util/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { dateToStringOnly } from "../screens/UserReservationUI";
import { Linking, Platform } from "react-native";
import { useToast } from "react-native-toast-notifications";
import Colors from "../colors/Color";
import { CAPTURE, REFUND } from "../util/secret-variables";

export const callNumber = (phone) => {
  let phoneNumber = phone;
  if (Platform.OS !== "android") {
    phoneNumber = `telprompt:${phone}`;
  } else {
    phoneNumber = `tel:${phone}`;
  }
  Linking.openURL(phoneNumber);
};

function OrderViewItem({ item }) {
  const [orderSum, setOrderSum] = useState(0);
  const toast = useToast();

  //how many products are in the order
  useEffect(() => {
    let sum = 0;
    let temp = item.cart;
    temp.forEach((element) => {
      sum += element.quantity;
    });
    setOrderSum(sum);
  }, []);

  function printOrder(cart) {
    let order = "";
    let size = 1;
    cart.forEach((element) => {
      order = order + element.name + " x " + element.quantity;
      if (size < cart.length) order += "\n";
      size++;
    });
    return order;
  }

  async function refundPayment(payment_id) {
    if (item.payAtPickup !== null && !item.payAtPickup) {
      const response = await fetch(REFUND, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_id: payment_id,
        }),
      });
      if ((response.status = 200)) {
        //payment refunded successfully
        updateCartOrder(
          item.uid,
          {
            cart: item.cart,
            payment_id: item.payment_id,
            customer_id: item.customer_id,
            payment_status: "refunded",
            phone: item.phone,
            date: item.date,
            payAtPickup: item.payAtPickup,
          },
          item.key
        );
      }
    } else {
      updateCartOrder(
        item.uid,
        {
          cart: item.cart,
          payment_id: item.payment_id,
          customer_id: item.customer_id,
          payment_status: "refunded",
          phone: item.phone,
          date: item.date,
          payAtPickup: item.payAtPickup,
        },
        item.key
      );
    }
  }

  async function capturePayment(payment_id) {
    if (item.payAtPickup !== null && !item.payAtPickup) {
      const response = await fetch(CAPTURE, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 100,
          cart: item.cart,
          payment_id: payment_id,
        }),
      });
      if ((response.status = 200)) {
        //the order was captured
        updateCartOrder(
          item.uid,
          {
            cart: item.cart,
            payment_id: item.payment_id,
            customer_id: item.customer_id,
            payment_status: "accepted",
            phone: item.phone,
            date: item.date,
            payAtPickup: item.payAtPickup,
          },
          item.key
        );
      }
    } else {
      updateCartOrder(
        item.uid,
        {
          cart: item.cart,
          payment_id: item.payment_id,
          customer_id: item.customer_id,
          payment_status: "accepted",
          phone: item.phone,
          date: item.date,
          payAtPickup: item.payAtPickup,
        },
        item.key
      );
    }
  }

  return (
    <Pressable
      onPress={() => {
        //depending on the order if you press on it it is possible to accept/reimburse
        if (item.status === "captured") {
          Alert.alert(
            "Accetta ordine",
            "Vuoi accettare l'ordine?\n" + printOrder(item.cart),
            [
              {
                text: "Cancel",
                onPress: () => {},
                style: "cancel",
              },
              { text: "OK", onPress: () => capturePayment(item.payment_id) },
            ]
          );
        } else if (
          item.status === "accepted" ||
          item.status === "asking_refund"
        ) {
          Alert.alert("Rimborso", "Vuoi rimborsare l'ordine?", [
            {
              text: "Cancel",
              onPress: () => {},
              style: "cancel",
            },
            { text: "OK", onPress: () => refundPayment(item.payment_id) },
          ]);
        }
      }}
    >
      <View
        style={{
          flex: 1,
          padding: 8,
          elevation: 8,
          margin: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 2,
          backgroundColor: "white",
          borderRadius: 8,
          flexDirection: "row",
        }}
      >
        <View style={{ width: "10%", flexDirection: "row" }}>
          <Ionicons
            name="call"
            size={22}
            color={Colors.primary500}
            style={{ alignSelf: "center" }}
            onPress={() => {
              // make call
              callNumber(item.phone);
            }}
          />
        </View>
        <View style={{ width: "85%", flexDirection: "row" }}>
          <View>
            <Text style={{ fontWeight: "bold" }}>
              {dateToStringOnly(item.date)}
            </Text>
            <Text>
              Ore:
              {item.date
                .toLocaleTimeString()
                .substring(0, item.date.toLocaleTimeString().length - 3)}
            </Text>
            <Text>Prodotti nell'ordine: {orderSum}</Text>
            {item.payAtPickup !== null && item.payAtPickup ? (
              <Text>Pagamento al ritiro</Text>
            ) : null}
            {item.payAtPickup === null || !item.payAtPickup ? (
              <Text>Pagamento tramite carta</Text>
            ) : null}
          </View>
          <View
            style={{
              width: "35%",
              alignItems: "center",
              justifyContent: "center",
            }}
          ></View>
        </View>
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <View>
            <Ionicons
              name="md-information-circle"
              size={22}
              color="black"
              style={{ alignSelf: "center" }}
              onPress={() => {
                toast.show(printOrder(item.cart), {
                  placement: "top",
                  type:
                    item.status === "captured"
                      ? "custom_type_pending_info"
                      : item.status === "accepted"
                      ? "custom_type_ok_info"
                      : item.status === "asking_refund"
                      ? "custom_type_refund_pending_info"
                      : item.status === "refunded"
                      ? "custom_type_refund_info"
                      : "custom_type_error_info",
                });
              }}
            />
          </View>
          <View
            style={{
              borderRadius: 200,
              height: "5%",
              width: "5%",
              backgroundColor:
                item.status === "captured"
                  ? "yellow"
                  : item.status === "accepted"
                  ? "green"
                  : item.status === "refunded" ||
                    item.status === "asking_refund"
                  ? "blue"
                  : "red",
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 2,
              padding: 8,
            }}
          ></View>
        </View>
      </View>
    </Pressable>
  );
}

export default OrderViewItem;
