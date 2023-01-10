import { useState } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { View, Text, Alert } from "react-native";
import { AuthContext } from "../store/auth-context";
import { updateCartOrder } from "../util/utils";
import Swipeout from "react-native-swipeout";
import Ionicons from "@expo/vector-icons/Ionicons";
import { dateToStringOnly } from "../screens/UserReservationUI";
import { useToast } from "react-native-toast-notifications";

function UserOrderView({ item }) {
  const [orderSum, setOrderSum] = useState(0);
  const authCtx = useContext(AuthContext);
  const toast = useToast();

  function askingRefund() {
    updateCartOrder(
      authCtx.userUID,
      {
        cart: item.cart,
        payment_id: item.payment_id,
        customer_id: item.customer_id,
        payment_status: "asking_refund",
        date: String(item.date),
        phone: item.phone,
      },
      item.key
    );
  }

  function deleteOrder() {
    updateCartOrder(
      authCtx.userUID,
      {
        cart: item.cart,
        payment_id: item.payment_id,
        customer_id: item.customer_id,
        payment_status: "deleted",
        date: String(item.date),
        phone: item.phone,
      },
      item.key
    );
  }

  let swipeBtns = [
    {
      backgroundColor: "transparent",
      onPress: () => {
        if (item.status === "captured") deleteOrder();
        if (item.status === "refunded")
          toast.show("Ordine già rimborsato! Non è possibile cancellarlo.", {
            placement: "top",
            type: "custom_type_error",
          });
        if (item.status === "accepted")
          Alert.alert(
            "Cancellazione",
            "Ordine già pagato! Vuoi richiedere un rimborso?",
            [
              {
                text: "Cancel",
                onPress: () => {},
                style: "cancel",
              },
              { text: "OK", onPress: () => askingRefund() },
            ]
          );
      },
      component: (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <Ionicons
            name="ios-trash"
            size={32}
            color="red"
            style={{ alignSelf: "center" }}
          />
        </View>
      ),
    },
  ];

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

  return (
    <Swipeout
      right={swipeBtns}
      autoClose={true}
      backgroundColor="transparent"
      buttonWidth={35}
    >
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
        <View style={{ width: "95%", flexDirection: "row" }}>
          <View style={{ width: "60%" }}>
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
    </Swipeout>
  );
}

export default UserOrderView;
