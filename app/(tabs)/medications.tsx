import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Plus, Clock, Pill, AlertCircle, Bell, BellOff, Heart } from 'lucide-react-native';
import { useMedicalProfile } from '@/contexts/medical-profile-database';
import { router } from 'expo-router';
import type { Medication } from '@/types/health';

export default function MedicationsScreen() {
  const { profile, removeMedication, getUpcomingMedications, isLoading } = useMedicalProfile();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [upcomingMeds, setUpcomingMeds] = useState<Medication[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setUpcomingMeds(getUpcomingMedications());
    }, 60000); // Update every minute

    setUpcomingMeds(getUpcomingMedications());

    return () => clearInterval(timer);
  }, [profile.medications]);

  const handleRemoveMedication = (id: string, name: string) => {
    Alert.alert(
      'Remove Medication',
      `Are you sure you want to remove "${name}" from your medications?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeMedication(id),
        },
      ]
    );
  };

  const getNextDoseTime = (medication: Medication) => {
    const now = new Date();
    const todayTimes = medication.times.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const doseTime = new Date();
      doseTime.setHours(hours, minutes, 0, 0);
      return doseTime;
    });

    const nextDose = todayTimes.find(time => time > now);
    if (nextDose) {
      return nextDose.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If no more doses today, return first dose tomorrow
    return `Tomorrow at ${medication.times[0]}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A896" />
        <Text style={styles.loadingText}>Loading medications...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {upcomingMeds.length > 0 && (
        <View style={styles.reminderSection}>
          <View style={styles.reminderHeader}>
            <Bell size={20} color="#FF6B6B" />
            <Text style={styles.reminderTitle}>Upcoming Medications</Text>
          </View>
          {upcomingMeds.map((med) => (
            <View key={med.id} style={styles.reminderCard}>
              <Pill size={16} color="#FF6B6B" />
              <Text style={styles.reminderText}>
                {med.name} - {med.dosage} due soon
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Pill size={20} color="#00A896" />
          <Text style={styles.sectionTitle}>Current Medications</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-medication')}
          >
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {profile.medications.length === 0 ? (
          <View style={styles.emptyState}>
            <Pill size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>No medications added</Text>
            <Text style={styles.emptySubtext}>
              Add your medications to get reminders and track side effects
            </Text>
          </View>
        ) : (
          profile.medications.map((medication) => (
            <View key={medication.id} style={styles.medicationCard}>
              <View style={styles.medicationHeader}>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDosage}>{medication.dosage}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveMedication(medication.id, medication.name)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.medicationDetails}>
                <View style={styles.detailRow}>
                  <Clock size={14} color="#8E8E93" />
                  <Text style={styles.detailText}>
                    {medication.frequency} at {medication.times.join(', ')}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Bell size={14} color="#00A896" />
                  <Text style={styles.nextDoseText}>
                    Next dose: {getNextDoseTime(medication)}
                  </Text>
                </View>

                {medication.forCondition && (
                  <View style={styles.detailRow}>
                    <Heart size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>
                      For: {medication.forCondition}
                    </Text>
                  </View>
                )}

                {medication.sideEffects && medication.sideEffects.length > 0 && (
                  <View style={styles.sideEffectsContainer}>
                    <View style={styles.detailRow}>
                      <AlertCircle size={14} color="#FF6B6B" />
                      <Text style={styles.sideEffectsTitle}>Possible side effects:</Text>
                    </View>
                    <Text style={styles.sideEffectsText}>
                      {medication.sideEffects.join(', ')}
                    </Text>
                  </View>
                )}

                {medication.notes && (
                  <Text style={styles.notesText}>{medication.notes}</Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.infoSection}>
        <AlertCircle size={16} color="#00A896" />
        <Text style={styles.infoText}>
          Medication reminders help you stay on track with your treatment plan. 
          Always consult your healthcare provider before making changes to your medications.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  reminderSection: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderText: {
    fontSize: 15,
    color: '#DC2626',
    fontWeight: '500',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 20,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  medicationCard: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  medicationDosage: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  removeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  removeButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  medicationDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '400',
  },
  nextDoseText: {
    fontSize: 15,
    color: '#6366F1',
    fontWeight: '600',
  },
  sideEffectsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sideEffectsTitle: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '600',
  },
  sideEffectsText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 24,
    marginTop: 6,
    lineHeight: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    marginTop: 12,
    lineHeight: 20,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 32,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 20,
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});