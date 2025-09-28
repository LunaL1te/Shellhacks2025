import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Plus, X, Heart, AlertTriangle, Database, Stethoscope, Activity, Shield, TrendingUp } from 'lucide-react-native';
import { useMedicalProfile } from '@/contexts/medical-profile-database';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { profile, removeChronicCondition, addAllergy, removeAllergy, removeSurgery } = useMedicalProfile();
  const [newAllergy, setNewAllergy] = useState('');

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      addAllergy(newAllergy.trim());
      setNewAllergy('');
    }
  };

  const handleRemoveCondition = (id: string, name: string) => {
    Alert.alert(
      'Remove Condition',
      `Are you sure you want to remove "${name}" from your medical profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeChronicCondition(id),
        },
      ]
    );
  };

  const handleRemoveSurgery = (id: string, name: string) => {
    Alert.alert(
      'Remove Surgery',
      `Are you sure you want to remove "${name}" from your medical profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeSurgery(id),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Heart size={20} color="#00A896" />
          <Text style={styles.sectionTitle}>Chronic Conditions</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-condition')}
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
                  Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                </Text>
                {condition.notes && (
                  <Text style={styles.cardNotes}>{condition.notes}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveCondition(condition.id, condition.name)}
                style={styles.removeButton}
              >
                <X size={18} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

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
            style={[styles.addButton, !newAllergy.trim() && styles.addButtonDisabled]}
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

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Stethoscope size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Previous Surgeries</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-surgery')}
          >
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {profile.surgeries.length === 0 ? (
          <Text style={styles.emptyText}>No surgeries recorded</Text>
        ) : (
          profile.surgeries.map((surgery) => (
            <View key={surgery.id} style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{surgery.name}</Text>
                <Text style={styles.cardSubtitle}>
                  Date: {new Date(surgery.date).toLocaleDateString()}
                </Text>
                {surgery.surgeon && (
                  <Text style={styles.cardSubtitle}>
                    Surgeon: {surgery.surgeon}
                  </Text>
                )}
                {surgery.hospital && (
                  <Text style={styles.cardSubtitle}>
                    Hospital: {surgery.hospital}
                  </Text>
                )}
                {surgery.recoveryTime && (
                  <Text style={styles.cardSubtitle}>
                    Recovery: {surgery.recoveryTime}
                  </Text>
                )}
                {surgery.notes && (
                  <Text style={styles.cardNotes}>{surgery.notes}</Text>
                )}
                {surgery.complications && surgery.complications.length > 0 && (
                  <Text style={styles.cardNotes}>
                    Complications: {surgery.complications.join(', ')}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveSurgery(surgery.id, surgery.name)}
                style={styles.removeButton}
              >
                <X size={18} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Profile Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Heart size={20} color="#EF4444" />
            </View>
            <Text style={styles.statNumber}>{profile.chronicConditions.length}</Text>
            <Text style={styles.statLabel}>Conditions</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Activity size={20} color="#6366F1" />
            </View>
            <Text style={styles.statNumber}>{profile.medications.length}</Text>
            <Text style={styles.statLabel}>Medications</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <AlertTriangle size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statNumber}>{profile.allergies.length}</Text>
            <Text style={styles.statLabel}>Allergies</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={20} color="#10B981" />
            </View>
            <Text style={styles.statNumber}>{profile.consultations.length}</Text>
            <Text style={styles.statLabel}>Consultations</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Stethoscope size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.statNumber}>{profile.surgeries.length}</Text>
            <Text style={styles.statLabel}>Surgeries</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.databaseButton}
          onPress={() => router.push('/database-management')}
        >
          <Database size={20} color="#00A896" />
          <Text style={styles.databaseButtonText}>Database Management</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#6366F1',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  card: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  cardNotes: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 6,
    fontStyle: 'italic',
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  emptyText: {
    paddingHorizontal: 20,
    fontSize: 15,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  allergyInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  allergyInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    fontWeight: '400',
  },
  allergyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  allergyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  allergyRemove: {
    padding: 2,
  },
  statsSection: {
    marginTop: 20,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  databaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  databaseButtonText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
});