import { StyleSheet, View, Button, Pressable, Text } from "react-native";
import { TextInput } from "react-native-paper";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/Context";
import { useContext } from "react";
import { signIn } from "../util/auth";
import { useToast } from "react-native-toast-notifications";

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const { goBack, setGoBack, setSignUp } = useContext(UserContext);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const toast = useToast();

  async function FirebaseLogin() {
    if (password.length > 0 && email.length > 0) {
      setIsAuthenticating(true);
      const result = await signIn(email, password);
      if (result === false) setIsAuthenticating(false);
    } else {
      toast.show("Le credenziali non rispettano i requisiti.", {
        placement: "top",
        type: "custom_type_error",
      });
    }
  }

  if (isAuthenticating) {
    return <Text>In progress...</Text>;
  } else
    return (
      <View>
        <View style={{ margin: 8 }}>
          <TextInput
            label={"E-mail"}
            error={error}
            onChangeText={(text) => {
              setEmail(text);
              let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
              if (reg.test(text) === false) {
                setError("Not Valid!");
                return false;
              } else {
                setError("");
              }
            }}
            value={email}
            keyboardType="email-address"
            mode="outlined"
          />
        </View>
        <View style={{ margin: 8 }}>
          <TextInput
            label={"Password"}
            secureTextEntry={true}
            mode="outlined"
            onChangeText={(text) => {
              setPassword(text);
            }}
            value={password}
            keyboardType="ascii-capable"
          />
        </View>
        <View style={{ margin: 8, borderRadius: 8 }}>
          <Button title="Log-in" onPress={FirebaseLogin} />
        </View>
        <Pressable
          onPress={() => {
            setSignUp(true);
            navigation.replace("Sign-Up");
          }}
          style={{ margin: 8 }}
        >
          <Text style={styles.signUpContainer}>Crea un nuovo utente</Text>
        </Pressable>
      </View>
    );
}

export default LoginScreen;

const styles = StyleSheet.create({
  signUpContainer: {
    textAlign: "center",
    fontWeight: "bold",
  },
});
