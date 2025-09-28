import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { Plus, X, Heart, AlertTriangle, User } from "lucide-react-native";
import { useMedicalProfile } from "@/contexts/medical-profile";
import { router, useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function ProfileScreen() {
  const {
    profile,
    removeChronicCondition,
    addAllergy,
    removeAllergy,
  } = useMedicalProfile();
  
  const userInfo = profile.userInfo;

  const [newAllergy, setNewAllergy] = useState("");
  const navigation = useNavigation();

  // Always restore Create button
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push("/SignUpScreen")}
          >
            <Text style={styles.headerButtonText}>Create</Text>
          </TouchableOpacity>
        ),
        headerTitle: "Medical Profile",
      });
    }, [navigation])
  );

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      addAllergy(newAllergy.trim());
      setNewAllergy("");
    }
  };

  const handleRemoveCondition = (id: string, name: string) => {
    Alert.alert(
      "Remove Condition",
      `Are you sure you want to remove "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeChronicCondition(id),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <User size={20} color="#00A896" />
          <Text style={styles.sectionTitle}>User Information</Text>
        </View>
        {userInfo ? (
          <View style={styles.userCard}>
            <Text style={styles.userName}>{userInfo.Name}</Text>
            <Text style={styles.userDetail}>📧 {userInfo.Email}</Text>
            <Text style={styles.userDetail}>📱 {userInfo.Phone}</Text>
            <Text style={styles.userDetail}>⚖️ {userInfo.Weight} lbs</Text>
            <Text style={styles.userDetail}>📏 {userInfo.Height}</Text>
            <Text style={styles.userDetail}>🎂 {userInfo.Age} years</Text>
            <Text style={styles.userDetail}>⚧ {userInfo.Gender}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>No account created yet</Text>
        )}
      </View>

      {/* Chronic Conditions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Heart size={20} color="#00A896" />
          <Text style={styles.sectionTitle}>Chronic Conditions</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/add-condition")}
          >
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        {profile.chronicConditions.length === 0 ? (
          <Text style={styles.emptyText}>No chronic conditions added</Text>
        ) : (
          profile.chronicConditions.map((condition) => (
            <View key={condition.id} style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{condition.name}</Text>
                <Text style={styles.cardSubtitle}>
                  Diagnosed:{" "}
                  {new Date(condition.diagnosedDate).toLocaleDateString()}
                </Text>
                {condition.notes && (
                  <Text style={styles.cardNotes}>{condition.notes}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() =>
                  handleRemoveCondition(condition.id, condition.name)
                }
                style={styles.removeButton}
              >
                <X size={18} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Allergies */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertTriangle size={20} color="#FF6B6B" />
          <Text style={styles.sectionTitle}>Allergies</Text>
        </View>
        <View style={styles.allergyInputContainer}>
          <TextInput
            style={styles.allergyInput}
            value={newAllergy}
            onChangeText={setNewAllergy}
            placeholder="Add an allergy..."
            placeholderTextColor="#8E8E93"
            onSubmitEditing={handleAddAllergy}
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              !newAllergy.trim() && styles.addButtonDisabled,
            ]}
            onPress={handleAddAllergy}
            disabled={!newAllergy.trim()}
          >
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.allergyList}>
          {profile.allergies.length === 0 ? (
            <Text style={styles.emptyText}>No allergies added</Text>
          ) : (
            profile.allergies.map((allergy, index) => (
              <View key={index} style={styles.allergyChip}>
                <Text style={styles.allergyText}>{allergy}</Text>
                <TouchableOpacity
                  onPress={() => removeAllergy(allergy)}
                  style={styles.allergyRemove}
                >
                  <X size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Profile Summary */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Profile Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {profile.chronicConditions.length}
            </Text>
            <Text style={styles.statLabel}>Conditions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{profile.medications.length}</Text>
            <Text style={styles.statLabel}>Medications</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{profile.allergies.length}</Text>
            <Text style={styles.statLabel}>Allergies</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {profile.consultations.length}
            </Text>
            <Text style={styles.statLabel}>Consultations</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  section: { backgroundColor: "#FFFFFF", marginTop: 16, paddingVertical: 16 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: { flex: 1, fontSize: 18, fontWeight: "600", color: "#1A1A1A" },
  headerButton: { marginRight: 12 },
  headerButtonText: { color: "#00A896", fontWeight: "600", fontSize: 16 },
  userCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1A1A1A",
  },
  userDetail: { fontSize: 15, color: "#333", marginBottom: 4 },
  addButton: {
    backgroundColor: "#00A896",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: { opacity: 0.5 },
  card: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  cardSubtitle: { fontSize: 14, color: "#8E8E93" },
  cardNotes: { fontSize: 14, color: "#636366", marginTop: 4 },
  removeButton: { padding: 4 },
  emptyText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  allergyInputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  allergyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: "#1A1A1A",
  },
  allergyList: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
  },
  allergyChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  allergyText: { color: "#FFFFFF", fontSize: 14, fontWeight: "500" },
  allergyRemove: { padding: 2 },
  statsSection: { marginTop: 16, marginBottom: 32, paddingHorizontal: 16 },
  statsTitle: { fontSize: 18, fontWeight: "600", color: "#1A1A1A", marginBottom: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#00A896",
    marginBottom: 4,
  },
  statLabel: { fontSize: 14, color: "#8E8E93" },
});
