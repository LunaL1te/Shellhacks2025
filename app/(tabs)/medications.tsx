import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Plus, Clock, Pill, AlertCircle, Bell, BellOff } from 'lucide-react-native';
import { useMedicalProfile } from '@/contexts/medical-profile';
import { router } from 'expo-router';
import type { Medication } from '@/types/health';

export default function MedicationsScreen() {
  const { profile, removeMedication, getUpcomingMedications } = useMedicalProfile();
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
    backgroundColor: '#F2F2F7',
  },
  reminderSection: {
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5E5',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  reminderText: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  addButton: {
    backgroundColor: '#00A896',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  medicationCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 15,
    color: '#00A896',
    fontWeight: '500',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  medicationDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  nextDoseText: {
    fontSize: 14,
    color: '#00A896',
    fontWeight: '500',
  },
  sideEffectsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  sideEffectsTitle: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  sideEffectsText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 20,
    marginTop: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#636366',
    fontStyle: 'italic',
    marginTop: 8,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
});