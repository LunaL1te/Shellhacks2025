import React from "react";
import RNPickerSelect from "react-native-picker-select";
import { View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const heightOptions: { label: string; value: string }[] = [];
for (let feet = 4; feet <= 7; feet++) {
  for (let inches = 0; inches < 12; inches++) {
    heightOptions.push({
      label: `${feet}'${inches}"`,
      value: `${feet}'${inches}"`,
    });
  }
}

export default function HeightPicker({
  onSelect,
}: {
  onSelect: (h: string) => void;
}) {
  return (
    <View pointerEvents="auto">
      <RNPickerSelect
        onValueChange={(value) => onSelect(value)}
        items={heightOptions}
        placeholder={{ label: "Select Height", value: null }}
        useNativeAndroidPickerStyle={false}
        Icon={() => <Ionicons name="chevron-down" size={20} color="#b36b00" />}
        style={{
          inputIOS: {
            color: "#000",
            fontSize: 16,
            paddingHorizontal: 14,
          },
          inputAndroid: {
            color: "#000",
            fontSize: 16,
            paddingHorizontal: 14,
          },
          inputIOSContainer: {
            height: 50,
            borderWidth: 1,
            borderColor: "#e6b800",
            borderRadius: 10,
            backgroundColor: "#fff",
            marginBottom: 18,
            justifyContent: "center",
          },
          inputAndroidContainer: {
            height: 50,
            borderWidth: 1,
            borderColor: "#e6b800",
            borderRadius: 10,
            backgroundColor: "#fff",
            marginBottom: 18,
            justifyContent: "center",
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
