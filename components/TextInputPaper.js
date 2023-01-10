import { TextInput } from "react-native-paper";

function TextInputPaper({
  value,
  maxLength,
  width,
  textAlign,
  mode,
  label,
  keyboardType,
  setValue,
}) {
  return (
    <TextInput
      value={value}
      onChangeText={(text) => {
        setValue(text);
      }}
      maxLength={maxLength}
      width={width}
      textAlign={textAlign}
      mode={mode}
      label={label}
      keyboardType={keyboardType}
    />
  );
}

export default TextInputPaper;
