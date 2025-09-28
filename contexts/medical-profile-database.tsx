import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { medicalDatabase } from '@/database/database';
import { DataMigrationService } from '@/database/migration';
import type { ChronicCondition, Consultation, MedicalProfile, Medication, Surgery } from '@/types/health';

const DEFAULT_USER_ID = 'default_user'; // For single-user app

export const [MedicalProfileProvider, useMedicalProfile] = createContextHook(() => {
  const [profile, setProfile] = useState<MedicalProfile>({
    chronicConditions: [],
    medications: [],
    allergies: [],
    consultations: [],
    surgeries: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  // Initialize database and load data
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Initialize database
        await medicalDatabase.initialize();
        setIsDatabaseReady(true);

        // Check if migration is needed
        const migrationCompleted = await DataMigrationService.isMigrationCompleted();
        const hasDataToMigrate = await DataMigrationService.hasDataToMigrate();

        if (!migrationCompleted && hasDataToMigrate) {
          console.log('Migrating data from AsyncStorage to database...');
          const migrationResult = await DataMigrationService.migrateFromAsyncStorage(DEFAULT_USER_ID);
          
          if (!migrationResult.success) {
            console.error('Migration failed:', migrationResult.error);
          } else {
            console.log('Migration completed:', migrationResult.migratedData);
          }
        }

        // Load data from database
        await loadProfileFromDatabase();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  const loadProfileFromDatabase = async () => {
    if (!isDatabaseReady) return;

    try {
      const [chronicConditions, medications, allergies, consultations, surgeries] = await Promise.all([
        medicalDatabase.getChronicConditions(DEFAULT_USER_ID),
        medicalDatabase.getMedications(DEFAULT_USER_ID),
        medicalDatabase.getAllergies(DEFAULT_USER_ID),
        medicalDatabase.getConsultations(DEFAULT_USER_ID),
        medicalDatabase.getSurgeries(DEFAULT_USER_ID),
      ]);

      // Convert database format to app format
      const convertedProfile: MedicalProfile = {
        chronicConditions: chronicConditions.map(condition => ({
          id: condition.id,
          name: condition.name,
          diagnosedDate: condition.diagnosed_date,
          notes: condition.notes,
        })),
        medications: medications.map(med => ({
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          times: med.times,
          startDate: med.start_date,
          endDate: med.end_date,
          sideEffects: med.side_effects ? JSON.parse(med.side_effects) : undefined,
          forCondition: med.for_condition,
          notes: med.notes,
        })),
        allergies: allergies.map(allergy => allergy.allergen),
        consultations: consultations.map(consultation => ({
          id: consultation.id,
          date: consultation.date,
          symptoms: consultation.symptoms,
          diagnosis: consultation.diagnosis,
          recommendations: consultation.recommendations ? JSON.parse(consultation.recommendations) : [],
          severity: consultation.severity,
        })),
        surgeries: surgeries.map(surgery => ({
          id: surgery.id,
          name: surgery.name,
          date: surgery.date,
          surgeon: surgery.surgeon,
          hospital: surgery.hospital,
          notes: surgery.notes,
          complications: surgery.complications ? JSON.parse(surgery.complications) : undefined,
          recoveryTime: surgery.recovery_time,
        })),
      };

      setProfile(convertedProfile);
    } catch (error) {
      console.error('Failed to load profile from database:', error);
    }
  };

  const addChronicCondition = async (condition: ChronicCondition) => {
    if (!isDatabaseReady) return;

    try {
      await medicalDatabase.createChronicCondition({
        user_id: DEFAULT_USER_ID,
        name: condition.name,
        diagnosed_date: condition.diagnosedDate,
        notes: condition.notes,
        status: 'active',
      });
      await loadProfileFromDatabase();
    } catch (error) {
      console.error('Failed to add chronic condition:', error);
    }
  };

  const removeChronicCondition = async (id: string) => {
    if (!isDatabaseReady) return;

    try {
      await medicalDatabase.deleteChronicCondition(id);
      await loadProfileFromDatabase();
    } catch (error) {
      console.error('Failed to remove chronic condition:', error);
    }
  };

  const addMedication = async (medication: Medication) => {
    if (!isDatabaseReady) return;

    try {
      await medicalDatabase.createMedication({
        user_id: DEFAULT_USER_ID,
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        start_date: medication.startDate,
        end_date: medication.endDate,
        side_effects: medication.sideEffects ? JSON.stringify(medication.sideEffects) : undefined,
        for_condition: medication.forCondition,
        notes: medication.notes,
        is_active: medication.endDate ? (new Date(medication.endDate) > new Date() ? 1 : 0) : 1,
      }, medication.times);
      await loadProfileFromDatabase();
    } catch (error) {
      console.error('Failed to add medication:', error);
    }
  };

  const updateMedication = async (id: string, medication: Medication) => {
    if (!isDatabaseReady) return;

    try {
      await medicalDatabase.updateMedication(id, {
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        start_date: medication.startDate,
        end_date: medication.endDate,
        side_effects: medication.sideEffects ? JSON.stringify(medication.sideEffects) : undefined,
        for_condition: medication.forCondition,
        notes: medication.notes,
        is_active: medication.endDate ? (new Date(medication.endDate) > new Date() ? 1 : 0) : 1,
      }, medication.times);
      await loadProfileFromDatabase();
    } catch (error) {
      console.error('Failed to update medication:', error);
    }
  };

  const removeMedication = async (id: string) => {
    if (!isDatabaseReady) return;

    try {
      await medicalDatabase.deleteMedication(id);
      await loadProfileFromDatabase();
    } catch (error) {
      console.error('Failed to remove medication:', error);
    }
  };

  const addAllergy = async (allergy: string) => {
    if (!isDatabaseReady) return;

    try {
      await medicalDatabase.createAllergy({
        user_id: DEFAULT_USER_ID,
        allergen: allergy,
        severity: 'mild',
      });
      await loadProfileFromDatabase();
    } catch (error) {
      console.error('Failed to add allergy:', error);
    }
  };

  const removeAllergy = async (allergy: string) => {
    if (!isDatabaseReady) return;

    try {
      // Find the allergy ID first
      const allergies = await medicalDatabase.getAllergies(DEFAULT_USER_ID);
      const allergyToDelete = allergies.find(a => a.allergen === allergy);
      
      if (allergyToDelete) {
        await medicalDatabase.deleteAllergy(allergyToDelete.id);
        await loadProfileFromDatabase();
      }
    } catch (error) {
      console.error('Failed to remove allergy:', error);
    }
  };

  const addConsultation = async (consultation: Consultation) => {
    if (!isDatabaseReady) return;

    try {
      await medicalDatabase.createConsultation({
        user_id: DEFAULT_USER_ID,
        date: consultation.date,
        symptoms: consultation.symptoms,
        diagnosis: consultation.diagnosis,
        recommendations: JSON.stringify(consultation.recommendations),
        severity: consultation.severity,
        ai_model: 'gpt-4',
      });
      await loadProfileFromDatabase();
    } catch (error) {
      console.error('Failed to add consultation:', error);
    }
  };

  const addSurgery = async (surgery: Surgery) => {
    if (!isDatabaseReady) return;

    try {
      await medicalDatabase.createSurgery({
        user_id: DEFAULT_USER_ID,
        name: surgery.name,
        date: surgery.date,
        surgeon: surgery.surgeon,
        hospital: surgery.hospital,
        notes: surgery.notes,
        complications: surgery.complications ? JSON.stringify(surgery.complications) : undefined,
        recovery_time: surgery.recoveryTime,
      });
      await loadProfileFromDatabase();
    } catch (error) {
      console.error('Failed to add surgery:', error);
    }
  };

  const removeSurgery = async (id: string) => {
    if (!isDatabaseReady) return;

    try {
      await medicalDatabase.deleteSurgery(id);
      await loadProfileFromDatabase();
    } catch (error) {
      console.error('Failed to remove surgery:', error);
    }
  };

  const getUpcomingMedications = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return profile.medications.filter(med => {
      // Check if medication is active
      if (med.endDate && new Date(med.endDate) < now) return false;
      
      // Check if any dose time is upcoming in the next hour
      return med.times.some(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const medTime = new Date();
        medTime.setHours(hours, minutes, 0, 0);
        const diff = medTime.getTime() - now.getTime();
        return diff > 0 && diff < 3600000; // Within next hour
      });
    });
  };

  const refreshProfile = async () => {
    if (isDatabaseReady) {
      await loadProfileFromDatabase();
    }
  };

  return {
    profile,
    isLoading,
    isDatabaseReady,
    addChronicCondition,
    removeChronicCondition,
    addMedication,
    updateMedication,
    removeMedication,
    addAllergy,
    removeAllergy,
    addConsultation,
    addSurgery,
    removeSurgery,
    getUpcomingMedications,
    refreshProfile,
  };
});
