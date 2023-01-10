import { StripeProvider } from "@stripe/stripe-react-native";
import { pub_live_key } from "../stripe/Stripe";
import { useStripe } from "@stripe/stripe-react-native";
import { useToast } from "react-native-toast-notifications";
//import messaging from "@react-native-firebase/messaging";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useContext, useEffect, useState } from "react";
import { TextInput } from "react-native-paper";
import { AuthContext } from "../store/auth-context";
import { Button, View, FlatList, Text, Platform } from "react-native";
import { useSelector } from "react-redux";
import ProductCartContainer from "../components/ProductCartContainer";
import { storeCartOrder } from "../util/utils";
import { restartCart } from "../redux/addOrderSlice";
import { useDispatch } from "react-redux";
import { CartContext } from "../context/Context";
import DropDownPicker from "react-native-dropdown-picker";
import { monthToString } from "./UserReservationUI";
import { dayToString } from "./UserReservationUI";
import CheckBox from "@react-native-community/checkbox";
import { CHARGE } from "../util/secret-variables";

function CheckoutScreen({ navigation }) {
  const [isComplete, setIsComplete] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [billingComplete, setBillingComplete] = useState(false);
  const [paymentDisabled, setPaymentDisabled] = useState(true);
  const [paymentIntent, setPaymentIntent] = useState();
  const [paymentIntentAdmin, setPaymentIntentAdmin] = useState();
  const [ephemeralKey, setEphemeralKey] = useState();
  const [customer, setCustomer] = useState();
  const userCtx = useContext(AuthContext);
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [totalAmount, setTotalAmount] = useState(0);
  const toast = useToast();

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [datePicked, setDatePicked] = useState(null);
  const [dateObjectPicked, setDateObject] = useState(null);
  const [phone, setPhone] = useState(null);
  const restaurantLunchTime = "12:00-15:30";
  const restaurantDinnerTime = "18:00-22:00";
  const closureDay = 3;
  const [isSelected, setSelection] = useState(false);

  //dropdown item hours
  const [openHours, setOpenHours] = useState(false);
  const [valueHours, setValueHours] = useState(null);
  const [itemsHours, setItemsHours] = useState([]);

  //dropdown item minutes
  const [openMinutes, setOpenMinutes] = useState(false);
  const [valueMinutes, setValueMinutes] = useState(null);
  const [itemsMinutes, setItemsMinutes] = useState([]);

  const { isCheckout, setCheckout } = useContext(CartContext);

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async (amount) => {
    const response = await fetch(CHARGE, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        uid: userCtx.userUID,
        cart: cart,
      }),
    });
    const {
      paymentIntent,
      ephemeralKey,
      paymentIntentAdmin,
      customer,
      publishableKey,
    } = await response.json();

    return {
      paymentIntent,
      ephemeralKey,
      paymentIntentAdmin,
      customer,
      publishableKey,
    };
  };

  useEffect(() => {
    let sum = 0;
    cart.forEach((element) => {
      sum += element.price * element.quantity;
    });
  }, [cart]);

  const initializePaymentSheet = async (amount) => {
    const {
      paymentIntent,
      ephemeralKey,
      paymentIntentAdmin,
      customer,
      publishableKey,
    } = await fetchPaymentSheetParams(amount);
    setPaymentIntent(paymentIntent);
    setPaymentIntentAdmin(paymentIntentAdmin);
    setEphemeralKey(ephemeralKey);
    setCustomer(customer);
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Alla Botte Ristorante",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: "Jane Doe",
      },
    });
    if (!error) {
      setLoading(true);
    }
  };

  useEffect(() => {
    if (totalAmount !== 0) initializePaymentSheet(totalAmount * 100);
  }, [totalAmount]);

  const openPaymentSheet = async () => {
    if (userCtx.userUID === null) {
      toast.show("Devi effettuare il login per fare il checkout!", {
        placement: "top",
        type: "custom_type_error",
      });
    } else {
      if (cart.length !== 0) {
        if (phone !== null && phone.length === 10) {
          if (dateObjectPicked !== null) {
            if (!isSelected) {
              const { error } = await presentPaymentSheet();

              if (error) {
                toast.show(error.message, {
                  placement: "top",
                  type: "custom_type_error",
                });
              } else {
                dateObjectPicked.setHours(valueHours);
                dateObjectPicked.setMinutes(valueMinutes);
                dateObjectPicked.setSeconds(0);
                storeCartOrder(userCtx.userUID, {
                  cart: cart,
                  payment_id: paymentIntentAdmin,
                  customer_id: customer,
                  payment_status: "captured",
                  date: String(dateObjectPicked),
                  phone: phone,
                  payAtPickup: false,
                });
                dispatch(restartCart());
                navigation.goBack();
                setCheckout(false);
              }
            } else {
              dateObjectPicked.setHours(valueHours);
              dateObjectPicked.setMinutes(valueMinutes);
              dateObjectPicked.setSeconds(0);
              storeCartOrder(userCtx.userUID, {
                cart: cart,
                customer_id: customer,
                payment_status: "captured",
                date: String(dateObjectPicked),
                phone: phone,
                payAtPickup: true,
              });
              dispatch(restartCart());
              navigation.goBack();
              setCheckout(false);
            }
          } else {
            toast.show("Scegliere una data valida!", {
              placement: "top",
              type: "custom_type_error",
            });
          }
        } else {
          toast.show("Inserire un numero di telefono valido!", {
            placement: "top",
            type: "custom_type_error",
          });
        }
      } else {
        toast.show("Il carrello risulta vuoto!", {
          placement: "top",
          type: "custom_type_error",
        });
      }
    }
  };

  useEffect(() => {
    let sum = 0;
    cart.forEach((element) => {
      sum += element.price * element.quantity;
    });
    setTotalAmount(sum);
  }, [cart]);

  useEffect(() => {
    if (
      name !== null &&
      city !== null &&
      postalCode !== null &&
      country !== null
    ) {
      if (
        name.length > 3 &&
        postalCode.length === 5 &&
        city.length > 3 &&
        country.length > 3
      )
        setBillingComplete(true);
      else setBillingComplete(false);
    } else setBillingComplete(false);
  }, [name, city, postalCode, country]);
  useEffect(() => {
    if (billingComplete && isComplete) setPaymentDisabled(false);
    else setPaymentDisabled(true);
  }, [isComplete, billingComplete]);

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
      hours.push({ label: startHour, value: startHour });
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
      hours.push({ label: startHour, value: startHour });
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
      toast.show("Questo è il giorno di chiusura del ristorante. ", {
        placement: "top",
        type: "custom_type_error",
      });
    }
  };

  return (
    <StripeProvider publishableKey={pub_live_key}>
      <View style={{ flex: 1 }}>
        <View style={{ height: "70%" }}>
          <View style={{ height: "45%" }}>
            {cart.length !== 0 ? (
              <FlatList
                data={cart}
                renderItem={({ item }) => {
                  return (
                    <ProductCartContainer item={item} isSwipeable={false} />
                  );
                }}
                keyExtractor={(item) => item.id}
              />
            ) : (
              <Text>Non ci sono elementi nel carrello.</Text>
            )}
          </View>
          <View style={{ height: 20, margin: 8, height: "10%" }}>
            <TextInput
              label={"Telefono"}
              maxLength={40}
              numberOfLines={1}
              onChangeText={(text) => {
                setPhone(text);
              }}
              value={phone}
              keyboardType="number-pad"
            />
          </View>
          <View style={Platform.OS == "ios" ? { zIndex: 5000 } : {}}>
            <View style={{ height: 20, marginTop: 20, margin: 8 }}>
              <Pressable onPress={showDatePicker}>
                <Text>
                  {datePicked === null
                    ? "Clicca per scegliere la data"
                    : datePicked}
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
                height: "10%",
                margin: 8,
              }}
            >
              <View style={{ width: "50%" }}>
                <DropDownPicker
                  open={openHours}
                  value={valueHours}
                  items={itemsHours}
                  setOpen={setOpenHours}
                  setValue={setValueHours}
                  setItems={setItemsHours}
                />
              </View>
              <View style={{ width: "50%" }}>
                <DropDownPicker
                  open={openMinutes}
                  value={valueMinutes}
                  items={itemsMinutes}
                  setOpen={setOpenMinutes}
                  setValue={setValueMinutes}
                  setItems={setItemsMinutes}
                />
              </View>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: "10%",
              margin: 8,
            }}
          >
            <CheckBox value={isSelected} onValueChange={setSelection} />
            <Text>Paga l'ordine in negozio.</Text>
          </View>
        </View>
        <View
          style={{
            height: "35%",
            width: "100%",
            padding: 10,
            borderRadius: 25,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Totale: {totalAmount} euro
          </Text>
          <Button
            title={isSelected ? "Ordina" : "Pay"}
            disabled={!loading}
            onPress={openPaymentSheet}
          />
        </View>
      </View>
    </StripeProvider>
  );
}

export default CheckoutScreen;
