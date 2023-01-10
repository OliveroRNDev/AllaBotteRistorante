import Swipeout from "react-native-swipeout";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";
import { deleteReservation } from "../util/utils";
import { useContext } from "react";
import { AuthContext } from "../store/auth-context";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";

function ReservationContainer({ item, children, isAdmin, onPress }) {
  const authCtx = useContext(AuthContext);

  let swipeBtns = [
    {
      backgroundColor: "transparent",
      onPress: () => {
        deleteReservation(isAdmin ? item.uid : authCtx.userUID, item.key);
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

  return (
    <Swipeout
      right={swipeBtns}
      autoClose={true}
      backgroundColor="transparent"
      buttonWidth={35}
    >
      <Pressable
        onPress={() => {
          onPress(item);
        }}
      >
        {children}
      </Pressable>
    </Swipeout>
  );
}

export default ReservationContainer;
