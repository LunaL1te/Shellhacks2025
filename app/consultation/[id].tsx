import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react-native';
import { useMedicalProfile } from '@/contexts/medical-profile';

export default function ConsultationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { profile } = useMedicalProfile();
  
  const consultation = profile.consultations.find(c => c.id === id);

  if (!consultation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Consultation not found</Text>
      </View>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFA500';
      case 'low': return '#00A896';
      default: return '#8E8E93';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateSection}>
          <Calendar size={20} color="#8E8E93" />
          <Text style={styles.date}>{formatDate(consultation.date)}</Text>
        </View>
        <View style={[
          styles.severityBadge,
          { backgroundColor: getSeverityColor(consultation.severity) + '20' }
        ]}>
          <Text style={[
            styles.severityText,
            { color: getSeverityColor(consultation.severity) }
          ]}>
            {consultation.severity.toUpperCase()} PRIORITY
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Symptoms Reported</Text>
        <View style={styles.card}>
          <Text style={styles.symptomsText}>{consultation.symptoms}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Assessment</Text>
        <View style={styles.card}>
          <Text style={styles.diagnosisText}>{consultation.diagnosis}</Text>
        </View>
      </View>

      {consultation.recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationsList}>
            {consultation.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <CheckCircle size={16} color="#00A896" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.disclaimer}>
        <AlertCircle size={16} color="#FF6B6B" />
        <Text style={styles.disclaimerText}>
          This assessment is based on AI analysis and should not replace professional medical advice. 
          Always consult with a healthcare provider for proper diagnosis and treatment.
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
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 32,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  date: {
    fontSize: 15,
    color: '#8E8E93',
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  symptomsText: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  diagnosisText: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    gap: 12,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#FF6B6B',
    lineHeight: 18,
  },
});