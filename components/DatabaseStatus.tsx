import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { Database, CheckCircle, AlertCircle } from 'lucide-react-native';

interface DatabaseStatusProps {
  isLoading: boolean;
  isDatabaseReady: boolean;
  error?: string;
}

export default function DatabaseStatus({ isLoading, isDatabaseReady, error }: DatabaseStatusProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#00A896" />
        <Text style={styles.text}>Initializing database...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <AlertCircle size={16} color="#FF6B6B" />
        <Text style={[styles.text, styles.errorText]}>Database error: {error}</Text>
      </View>
    );
  }

  if (isDatabaseReady) {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <CheckCircle size={16} color="#00A896" />
        <Text style={[styles.text, styles.successText]}>Database ready</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  successContainer: {
    backgroundColor: '#F0F9F4',
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
  },
  text: {
    fontSize: 12,
    color: '#8E8E93',
  },
  successText: {
    color: '#00A896',
  },
  errorText: {
    color: '#FF6B6B',
  },
});
