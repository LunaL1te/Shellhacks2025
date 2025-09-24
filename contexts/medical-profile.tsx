import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import type { ChronicCondition, Consultation, MedicalProfile, Medication } from '@/types/health';

const STORAGE_KEY = 'medical_profile';

export const [MedicalProfileProvider, useMedicalProfile] = createContextHook(() => {
  const [profile, setProfile] = useState<MedicalProfile>({
    chronicConditions: [],
    medications: [],
    allergies: [],
    consultations: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from storage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setProfile(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load medical profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Save profile to storage whenever it changes
  const saveProfile = async (newProfile: MedicalProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error('Failed to save medical profile:', error);
    }
  };

  const addChronicCondition = (condition: ChronicCondition) => {
    const updated = {
      ...profile,
      chronicConditions: [...profile.chronicConditions, condition],
    };
    saveProfile(updated);
  };

  const removeChronicCondition = (id: string) => {
    const updated = {
      ...profile,
      chronicConditions: profile.chronicConditions.filter(c => c.id !== id),
    };
    saveProfile(updated);
  };

  const addMedication = (medication: Medication) => {
    const updated = {
      ...profile,
      medications: [...profile.medications, medication],
    };
    saveProfile(updated);
  };

  const updateMedication = (id: string, medication: Medication) => {
    const updated = {
      ...profile,
      medications: profile.medications.map(m => m.id === id ? medication : m),
    };
    saveProfile(updated);
  };

  const removeMedication = (id: string) => {
    const updated = {
      ...profile,
      medications: profile.medications.filter(m => m.id !== id),
    };
    saveProfile(updated);
  };

  const addAllergy = (allergy: string) => {
    const updated = {
      ...profile,
      allergies: [...profile.allergies, allergy],
    };
    saveProfile(updated);
  };

  const removeAllergy = (allergy: string) => {
    const updated = {
      ...profile,
      allergies: profile.allergies.filter(a => a !== allergy),
    };
    saveProfile(updated);
  };

  const addConsultation = (consultation: Consultation) => {
    const updated = {
      ...profile,
      consultations: [consultation, ...profile.consultations],
    };
    saveProfile(updated);
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

  return {
    profile,
    isLoading,
    addChronicCondition,
    removeChronicCondition,
    addMedication,
    updateMedication,
    removeMedication,
    addAllergy,
    removeAllergy,
    addConsultation,
    getUpcomingMedications,
  };
});