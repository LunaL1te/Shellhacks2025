import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useMedicalProfile } from "@/contexts/medical-profile";
import HeightPicker from "../components/HeightPicker";
import WeightPicker from "../components/WeightPicker";
import GenderPicker from "../components/GenderPicker";

export default function SignUpScreen() {
  const router = useRouter();
  const { profile } = useMedicalProfile();
  const [patient, setPatient] = useState({
    Name: "",
    Email: "",
    Phone: "",
    Weight: 0,
    Height: "",
    Gender: "",
    Age: 0,
  });

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return text;
    return [match[1], match[2], match[3]].filter(Boolean).join("-");
  };

  const handleAgeInput = (text: string) => {
    let num = parseInt(text) || 0;
    if (num < 0) num = 0;
    if (num > 150) num = 150;
    setPatient({ ...patient, Age: num });
  };

  const { setUserInfo } = useMedicalProfile();

  const handleSubmit = () => {
    Keyboard.dismiss();
  
    if (!patient.Name || !patient.Email || !patient.Phone) {
      Alert.alert("Missing Info", "Please fill in all required fields.");
      return;
    }
  
    // Save to global context
    setUserInfo(patient);
  
    // Close this screen and return to profile
    router.back();
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#fff8dc" }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>User Information</Text>

          {/* Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Enter your full name"
            placeholderTextColor="#b36b00"
            value={patient.Name}
            onChangeText={(text) => setPatient({ ...patient, Name: text })}
            style={styles.input}
          />

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#b36b00"
            keyboardType="email-address"
            value={patient.Email}
            onChangeText={(text) => setPatient({ ...patient, Email: text })}
            style={styles.input}
          />

          {/* Phone */}
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder="Enter your phone number"
            placeholderTextColor="#b36b00"
            keyboardType="phone-pad"
            value={patient.Phone}
            onChangeText={(text) =>
              setPatient({ ...patient, Phone: formatPhone(text) })
            }
            style={styles.input}
            maxLength={12}
          />

          {/* Weight Dropdown */}
          <Text style={styles.label}>Weight</Text>
          <WeightPicker onSelect={(w) => setPatient({ ...patient, Weight: w })} />

          {/* Height Dropdown */}
          <Text style={styles.label}>Height</Text>
          <HeightPicker onSelect={(h) => setPatient({ ...patient, Height: h })} />

          {/* Age */}
          <Text style={styles.label}>Age</Text>
          <TextInput
            placeholder="Enter your age"
            placeholderTextColor="#b36b00"
            keyboardType="numeric"
            value={patient.Age.toString()}
            onChangeText={handleAgeInput}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />

          {/* Gender Dropdown */}
          <Text style={styles.label}>Gender</Text>
          <GenderPicker onSelect={(g) => setPatient({ ...patient, Gender: g })} />

          <View style={styles.buttonContainer}>
            <Button color="#e6b800" title="Create Account" onPress={handleSubmit} />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: "#fff8dc" },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#e6b800",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#5a3e2b",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e6b800",
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#000",
  },
  buttonContainer: { marginTop: 30 },
});
