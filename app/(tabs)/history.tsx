import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Calendar, AlertCircle, ChevronRight } from 'lucide-react-native';
import { useMedicalProfile } from '@/contexts/medical-profile';
import { router } from 'expo-router';

export default function HistoryScreen() {
  const { profile } = useMedicalProfile();

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Calendar size={24} color="#00A896" />
        <Text style={styles.headerTitle}>Consultation History</Text>
      </View>

      {profile.consultations.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={48} color="#C7C7CC" />
          <Text style={styles.emptyText}>No consultations yet</Text>
          <Text style={styles.emptySubtext}>
            Your health check history will appear here
          </Text>
        </View>
      ) : (
        <View style={styles.consultationsList}>
          {profile.consultations.map((consultation) => (
            <TouchableOpacity
              key={consultation.id}
              style={styles.consultationCard}
              onPress={() => router.push(`/consultation/${consultation.id}`)}
            >
              <View style={styles.consultationHeader}>
                <View style={styles.dateContainer}>
                  <Text style={styles.consultationDate}>
                    {formatDate(consultation.date)}
                  </Text>
                </View>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(consultation.severity) + '20' }
                ]}>
                  <Text style={[
                    styles.severityText,
                    { color: getSeverityColor(consultation.severity) }
                  ]}>
                    {consultation.severity.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.symptomsText} numberOfLines={2}>
                {consultation.symptoms}
              </Text>

              <View style={styles.consultationFooter}>
                <View style={styles.recommendationsPreview}>
                  <AlertCircle size={14} color="#8E8E93" />
                  <Text style={styles.recommendationsCount}>
                    {consultation.recommendations.length} recommendations
                  </Text>
                </View>
                <ChevronRight size={20} color="#C7C7CC" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Health Insights</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {profile.consultations.length}
            </Text>
            <Text style={styles.statLabel}>Total Consultations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {profile.consultations.filter(c => c.severity === 'high').length}
            </Text>
            <Text style={styles.statLabel}>High Priority</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
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
  consultationsList: {
    padding: 16,
    gap: 12,
  },
  consultationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  consultationDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  symptomsText: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 20,
    marginBottom: 12,
  },
  consultationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recommendationsCount: {
    fontSize: 13,
    color: '#8E8E93',
  },
  statsSection: {
    padding: 16,
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00A896',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
});