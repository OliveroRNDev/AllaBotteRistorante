import { Text, StyleSheet } from "react-native";
import ProductsScreen from "./ProductsScreen";
import Colors from "../colors/Color";
import TablesUI from "./TablesUI";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useContext, useEffect } from "react";
import { useToast } from "react-native-toast-notifications";
import { CourseContext, ReservationContext } from "../context/Context";
import { AuthContext } from "../store/auth-context";
import UserManageScreen from "./UserManageScreen";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import AdminReservationUI from "./AdminReservationUI";
import OrdersMadeAdmin from "./OrdersMadeAdmin";
import { auth } from "../util/firebase-config";
import ScreenSettings from "./ScreenSettings";
import { Alert } from "react-native";
import { ProductContext } from "../context/Context";

function AdminAuth({ goBack, isSignUp }) {
  const Drawer = createDrawerNavigator();
  const userCtx = useContext(AuthContext);
  const [isPending, setPending] = useState(false);
  const toast = useToast();
  const [course, setCourse] = useState(null);

  function CustomDrawerContent(props) {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label="Log-out"
          onPress={async () => {
            props.navigation.closeDrawer();
            await userCtx.logout();
          }}
        />
        <DrawerItem
          label="Cancella account"
          onPress={async () => {
            //cancella account
            Alert.alert(
              "Cancellazione",
              "Sei sicuro di voler cancellare l'utente?",
              [
                {
                  text: "Annulla",
                  onPress: () => {},
                  style: "cancel",
                },
                {
                  text: "Accetta",
                  onPress: () => {
                    auth.currentUser
                      .delete()
                      .then(async () => {
                        await userCtx.logout();
                      })
                      .catch((err) => {
                        toast.show(err, {
                          placement: "top",
                          type: "custom_type_error",
                        });
                      });
                  },
                  style: "default",
                },
              ]
            );
          }}
        />
      </DrawerContentScrollView>
    );
  }

  return (
    <CourseContext.Provider value={course}>
      <ReservationContext.Provider value={isPending}>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={({ route }) => ({
            headerShown: goBack === true ? false : true,
            headerTintColor: "black",
            headerRight: () => {
              if (route.name === "Status Prenotazioni") {
                if (isPending) {
                  return (
                    <Ionicons
                      name="calendar"
                      size={32}
                      color="black"
                      onPress={() => {
                        setPending(false);
                      }}
                    />
                  );
                } else {
                  return (
                    <Ionicons
                      name="list"
                      size={32}
                      color="black"
                      onPress={() => {
                        setPending(true);
                      }}
                    />
                  );
                }
              } else return null;
            },
            headerTitle: () => {
              if (goBack === true) return null;
              else if (route.name === "Log-in" && isSignUp === false)
                return <Text style={styles.titleStyle}>Log-in</Text>;
              else if (route.name === "Log-in" && isSignUp === true)
                return <Text style={styles.titleStyle}>Sign-up</Text>;
              else return <Text style={styles.titleStyle}>{route.name}</Text>;
            },
            headerStyle: {
              backgroundColor: Colors.primary500,
              elevation: 0,
              shadowOpacity: 0,
            },
          })}
        >
          <Drawer.Screen name="Tavoli" component={TablesUI} />
          <Drawer.Screen name="Prodotti" component={ProductsScreen} />
          <Drawer.Screen
            name="Status Prenotazioni"
            component={AdminReservationUI}
          />
          <Drawer.Screen name="Utenti" component={UserManageScreen} />
          <Drawer.Screen name="Ordini" component={OrdersMadeAdmin} />
          <Drawer.Screen name="Impostazioni" component={ScreenSettings} />
        </Drawer.Navigator>
      </ReservationContext.Provider>
    </CourseContext.Provider>
  );
}

export default AdminAuth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  titleStyle: {
    fontSize: 20,
  },
});
