import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Database, Trash2, Download, Upload, RefreshCw, AlertTriangle } from 'lucide-react-native';
import { useMedicalProfile } from '@/contexts/medical-profile-database';
import { DataMigrationService } from '@/database/migration';

export default function DatabaseManagementScreen() {
  const { profile, refreshProfile, isDatabaseReady } = useMedicalProfile();
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await refreshProfile();
      Alert.alert('Success', 'Data refreshed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your medical data. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await DataMigrationService.resetAllData();
              await refreshProfile();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    // In a real app, you would implement actual data export
    Alert.alert(
      'Export Data',
      'Data export feature will be available in a future update. For now, your data is safely stored in the local database.',
      [{ text: 'OK' }]
    );
  };

  const handleImportData = () => {
    // In a real app, you would implement actual data import
    Alert.alert(
      'Import Data',
      'Data import feature will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const getDataSummary = () => {
    return {
      chronicConditions: profile.chronicConditions.length,
      medications: profile.medications.length,
      allergies: profile.allergies.length,
      consultations: profile.consultations.length,
    };
  };

  const summary = getDataSummary();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Database size={32} color="#00A896" />
        <Text style={styles.title}>Database Management</Text>
        <Text style={styles.subtitle}>Manage your medical data storage</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Database Status</Text>
          <View style={[styles.statusIndicator, { backgroundColor: isDatabaseReady ? '#00A896' : '#FF6B6B' }]} />
        </View>
        <Text style={styles.statusText}>
          {isDatabaseReady ? 'Database is ready and operational' : 'Database is not ready'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.chronicConditions}</Text>
            <Text style={styles.summaryLabel}>Conditions</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.medications}</Text>
            <Text style={styles.summaryLabel}>Medications</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.allergies}</Text>
            <Text style={styles.summaryLabel}>Allergies</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.consultations}</Text>
            <Text style={styles.summaryLabel}>Consultations</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Operations</Text>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleRefreshData}
          disabled={isLoading}
        >
          <RefreshCw size={20} color="#00A896" />
          <Text style={styles.actionButtonText}>Refresh Data</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleExportData}
          disabled={isLoading}
        >
          <Download size={20} color="#00A896" />
          <Text style={styles.actionButtonText}>Export Data</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleImportData}
          disabled={isLoading}
        >
          <Upload size={20} color="#00A896" />
          <Text style={styles.actionButtonText}>Import Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]} 
          onPress={handleClearAllData}
          disabled={isLoading}
        >
          <Trash2 size={20} color="#FF6B6B" />
          <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <AlertTriangle size={20} color="#FFA500" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Data Storage Information</Text>
          <Text style={styles.infoText}>
            Your medical data is stored locally on your device using SQLite database. 
            This ensures your data remains private and accessible even without internet connection.
          </Text>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00A896" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00A896',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  dangerText: {
    color: '#FF6B6B',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8F00',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#FF8F00',
    lineHeight: 18,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
