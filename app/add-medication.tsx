import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useMedicalProfile } from '@/contexts/medical-profile-database';
import type { Medication } from '@/types/health';

export default function AddMedicationScreen() {
  const { addMedication } = useMedicalProfile();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [times, setTimes] = useState('');
  const [forCondition, setForCondition] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!name.trim() || !dosage.trim() || !frequency.trim() || !times.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const medication: Medication = {
      id: Date.now().toString(),
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      times: times.split(',').map(t => t.trim()),
      startDate: new Date().toISOString(),
      forCondition: forCondition.trim() || undefined,
      sideEffects: sideEffects ? sideEffects.split(',').map(s => s.trim()) : undefined,
      notes: notes.trim() || undefined,
    };

    addMedication(medication);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medication Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Metformin"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dosage *</Text>
            <TextInput
              style={styles.input}
              value={dosage}
              onChangeText={setDosage}
              placeholder="e.g., 500mg"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Frequency *</Text>
            <TextInput
              style={styles.input}
              value={frequency}
              onChangeText={setFrequency}
              placeholder="e.g., Twice daily"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Times (comma separated) *</Text>
            <TextInput
              style={styles.input}
              value={times}
              onChangeText={setTimes}
              placeholder="e.g., 08:00, 20:00"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>For Condition (Optional)</Text>
            <TextInput
              style={styles.input}
              value={forCondition}
              onChangeText={setForCondition}
              placeholder="e.g., Diabetes"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Side Effects (comma separated, optional)</Text>
            <TextInput
              style={styles.input}
              value={sideEffects}
              onChangeText={setSideEffects}
              placeholder="e.g., Nausea, Dizziness"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional instructions..."
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, (!name.trim() || !dosage.trim() || !frequency.trim() || !times.trim()) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!name.trim() || !dosage.trim() || !frequency.trim() || !times.trim()}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#00A896',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});