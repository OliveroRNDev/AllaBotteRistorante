import { StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./LoginScreen";
import SignUpScreen from "./SignUpScreen";
import Colors from "../colors/Color";

function UserHandleScreen() {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        headerTitle: route.name,
        headerStyle: {
          backgroundColor: Colors.primary500,
          elevation: 0,
          shadowOpacity: 0,
        },
      })}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Sign-Up" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

export default UserHandleScreen;

const styles = StyleSheet.create({});
