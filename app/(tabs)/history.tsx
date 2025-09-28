import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Calendar, AlertCircle, ChevronRight } from 'lucide-react-native';
import { useMedicalProfile } from '@/contexts/medical-profile-database';
import { router } from 'expo-router';

export default function HistoryScreen() {
  const { profile, isLoading } = useMedicalProfile();

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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A896" />
        <Text style={styles.loadingText}>Loading consultation history...</Text>
      </View>
    );
  }

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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  consultationsList: {
    padding: 16,
    gap: 16,
  },
  consultationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateContainer: {
    flex: 1,
  },
  consultationDate: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  symptomsText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 16,
    fontWeight: '400',
  },
  consultationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendationsCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsSection: {
    padding: 20,
    marginBottom: 32,
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
    gap: 16,
  },
  statCard: {
    flex: 1,
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
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6366F1',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
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