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
import type { Surgery } from '@/types/health';

export default function AddSurgeryScreen() {
  const { addSurgery } = useMedicalProfile();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [surgeon, setSurgeon] = useState('');
  const [hospital, setHospital] = useState('');
  const [notes, setNotes] = useState('');
  const [complications, setComplications] = useState('');
  const [recoveryTime, setRecoveryTime] = useState('');

  const handleSave = () => {
    if (!name.trim() || !date.trim()) {
      Alert.alert('Error', 'Please fill in surgery name and date');
      return;
    }

    const surgery: Surgery = {
      id: Date.now().toString(),
      name: name.trim(),
      date: date.trim(),
      surgeon: surgeon.trim() || undefined,
      hospital: hospital.trim() || undefined,
      notes: notes.trim() || undefined,
      complications: complications ? complications.split(',').map(c => c.trim()) : undefined,
      recoveryTime: recoveryTime.trim() || undefined,
    };

    addSurgery(surgery);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Surgery</Text>
          <Text style={styles.subtitle}>Record a previous surgery</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Surgery Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Appendectomy, Knee Replacement"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Surgeon</Text>
            <TextInput
              style={styles.input}
              value={surgeon}
              onChangeText={setSurgeon}
              placeholder="Surgeon's name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hospital</Text>
            <TextInput
              style={styles.input}
              value={hospital}
              onChangeText={setHospital}
              placeholder="Hospital or clinic name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Recovery Time</Text>
            <TextInput
              style={styles.input}
              value={recoveryTime}
              onChangeText={setRecoveryTime}
              placeholder="e.g., 6 weeks, 3 months"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Complications</Text>
            <TextInput
              style={styles.input}
              value={complications}
              onChangeText={setComplications}
              placeholder="Separate multiple complications with commas"
              placeholderTextColor="#999"
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes about the surgery"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Surgery</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
