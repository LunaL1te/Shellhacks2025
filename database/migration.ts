import AsyncStorage from '@react-native-async-storage/async-storage';
import { medicalDatabase } from './database';
import type { MedicalProfile } from '@/types/health';

const STORAGE_KEY = 'medical_profile';

export interface MigrationResult {
  success: boolean;
  migratedData?: {
    chronicConditions: number;
    medications: number;
    allergies: number;
    consultations: number;
  };
  error?: string;
}

export class DataMigrationService {
  /**
   * Migrates data from AsyncStorage to SQLite database
   */
  static async migrateFromAsyncStorage(userId: string): Promise<MigrationResult> {
    try {
      // Check if migration is needed
      const hasStoredData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!hasStoredData) {
        return { success: true, migratedData: { chronicConditions: 0, medications: 0, allergies: 0, consultations: 0 } };
      }

      // Parse existing data
      const profile: MedicalProfile = JSON.parse(hasStoredData);
      
      // Initialize database if not already done
      await medicalDatabase.initialize();

      let migratedCounts = {
        chronicConditions: 0,
        medications: 0,
        allergies: 0,
        consultations: 0
      };

      // Migrate chronic conditions
      for (const condition of profile.chronicConditions) {
        await medicalDatabase.createChronicCondition({
          user_id: userId,
          name: condition.name,
          diagnosed_date: condition.diagnosedDate,
          notes: condition.notes,
          status: 'active'
        });
        migratedCounts.chronicConditions++;
      }

      // Migrate medications
      for (const medication of profile.medications) {
        await medicalDatabase.createMedication({
          user_id: userId,
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          start_date: medication.startDate,
          end_date: medication.endDate,
          side_effects: medication.sideEffects ? JSON.stringify(medication.sideEffects) : undefined,
          for_condition: medication.forCondition,
          notes: medication.notes,
          is_active: medication.endDate ? (new Date(medication.endDate) > new Date() ? 1 : 0) : 1
        }, medication.times);
        migratedCounts.medications++;
      }

      // Migrate allergies
      for (const allergy of profile.allergies) {
        await medicalDatabase.createAllergy({
          user_id: userId,
          allergen: allergy,
          severity: 'mild' // Default severity for migrated allergies
        });
        migratedCounts.allergies++;
      }

      // Migrate consultations
      for (const consultation of profile.consultations) {
        await medicalDatabase.createConsultation({
          user_id: userId,
          date: consultation.date,
          symptoms: consultation.symptoms,
          diagnosis: consultation.diagnosis,
          recommendations: JSON.stringify(consultation.recommendations),
          severity: consultation.severity,
          ai_model: 'gpt-4'
        });
        migratedCounts.consultations++;
      }

      // Mark migration as completed
      await AsyncStorage.setItem('migration_completed', 'true');
      
      // Optionally, remove old data from AsyncStorage
      // await AsyncStorage.removeItem(STORAGE_KEY);

      return {
        success: true,
        migratedData: migratedCounts
      };

    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown migration error'
      };
    }
  }

  /**
   * Checks if migration has been completed
   */
  static async isMigrationCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem('migration_completed');
      return completed === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Checks if there's data in AsyncStorage that needs migration
   */
  static async hasDataToMigrate(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return false;
      
      const profile: MedicalProfile = JSON.parse(data);
      return (
        profile.chronicConditions.length > 0 ||
        profile.medications.length > 0 ||
        profile.allergies.length > 0 ||
        profile.consultations.length > 0
      );
    } catch {
      return false;
    }
  }

  /**
   * Clears migration flag (useful for testing)
   */
  static async clearMigrationFlag(): Promise<void> {
    await AsyncStorage.removeItem('migration_completed');
  }

  /**
   * Performs a complete data reset (clears both AsyncStorage and database)
   */
  static async resetAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem('migration_completed');
      await medicalDatabase.clearAllData();
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw error;
    }
  }
}
