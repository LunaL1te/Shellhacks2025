import React from "react";
import RNPickerSelect from "react-native-picker-select";
import { View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Not Listed", value: "Not Listed" },
  { label: "Prefer not to say", value: "Prefer not to say" },
];

export default function GenderPicker({
  onSelect,
}: {
  onSelect: (g: string) => void;
}) {
  return (
    <View pointerEvents="auto">
      <RNPickerSelect
        onValueChange={(value) => onSelect(value)}
        items={genderOptions}
        placeholder={{ label: "Select Gender", value: null }}
        useNativeAndroidPickerStyle={false}
        Icon={() => <Ionicons name="chevron-down" size={20} color="#b36b00" />}
        style={{
          inputIOS: {
            height: 50,
            borderWidth: 1,
            borderColor: "#e6b800",
            borderRadius: 10,
            paddingHorizontal: 14,
            backgroundColor: "#fff",
            marginBottom: 18,
            color: "#000",
          },
          inputAndroid: {
            height: 50,
            borderWidth: 1,
            borderColor: "#e6b800",
            borderRadius: 10,
            paddingHorizontal: 14,
            backgroundColor: "#fff",
            marginBottom: 18,
            color: "#000",
          },
          placeholder: {
            color: "#b36b00",
          },
          iconContainer: {
            top: 15,
            right: 12,
          },
        }}
      />
    </View>
  );
}
