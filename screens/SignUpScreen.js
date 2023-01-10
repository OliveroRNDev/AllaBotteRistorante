import { StyleSheet, View, Button, Pressable, Text } from "react-native";
import { TextInput } from "react-native-paper";
import { useState } from "react";
import { createUser } from "../util/auth";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/Context";
import { useContext, useEffect } from "react";
import { useToast } from "react-native-toast-notifications";
import CheckBox from "@react-native-community/checkbox";
import { Linking } from "react-native";

function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [emailCheck, setEmailCheck] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigation = useNavigation();
  const { goBack, setGoBack, setSignUp } = useContext(UserContext);
  const toast = useToast();
  const [isSelected, setSelection] = useState(false);

  useEffect(() => {
    if (email === emailCheck) setError("");
    else setError("Not corresponding!");
  }, [email, emailCheck]);

  async function FirebaseSignUp() {
    //have to check login
    if (
      password.length > 0 &&
      email.length > 0 &&
      password === password &&
      email === emailCheck &&
      isAuthenticating === false
    ) {
      if (isSelected) {
        setIsAuthenticating(true);
        const result = await createUser(email, password);
        if (result === false) setIsAuthenticating(false);
      } else {
        toast.show(
          "Devi confermare di aver letto l'informativa sulla privacy.",
          {
            placement: "top",
            type: "custom_type_error",
          }
        );
      }
    } else {
      toast.show("Le credenziali non rispettano i requisiti!", {
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
            mode="outlined"
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
          />
        </View>
        <View style={{ margin: 8 }}>
          <TextInput
            label={"Conferma e-mail"}
            error={error}
            mode="outlined"
            onChangeText={(text) => {
              setEmailCheck(text);
              let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
              if (reg.test(text) === false) {
                setError("Not Valid!");
                return false;
              } else {
                if (email === text) setError("");
                else setError("Not corresponding!");
              }
            }}
            value={emailCheck}
            keyboardType="email-address"
          />
        </View>
        <View style={{ margin: 8 }}>
          <TextInput
            label={"Password"}
            mode="outlined"
            secureTextEntry={true}
            onChangeText={(text) => {
              setPassword(text);
            }}
            value={password}
            keyboardType="ascii-capable"
          />
        </View>
        <View style={{ margin: 8 }}>
          <TextInput
            label={"Conferma password"}
            mode="outlined"
            secureTextEntry={true}
            onChangeText={(text) => {
              setPasswordCheck(text);
            }}
            value={passwordCheck}
            keyboardType="ascii-capable"
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", margin: 8 }}>
          <CheckBox value={isSelected} onValueChange={setSelection} />
          <Text> Accetto le privacy e policy</Text>
        </View>
        <Pressable
          onPress={() => {
            Linking.openURL(
              "https://www.privacypolicies.com/live/87addf95-3e4b-40f8-aee9-cca020a4b533"
            );
          }}
          style={{ margin: 8 }}
        >
          <Text style={{ textDecorationLine: "underline" }}>
            Informativa sulla privacy
          </Text>
        </Pressable>
        <View style={{ margin: 8, borderRadius: 8 }}>
          <Button title="Sign-up" onPress={FirebaseSignUp} />
        </View>
        <Pressable
          onPress={() => {
            setSignUp(false);
            navigation.replace("Login");
          }}
          style={{ margin: 8 }}
        >
          <Text style={styles.signUpContainer}>Login</Text>
        </Pressable>
      </View>
    );
}

export default SignUpScreen;

const styles = StyleSheet.create({
  signUpContainer: {
    textAlign: "center",
    fontWeight: "bold",
  },
});
