import React, { createContext, useContext, useState } from "react";
import type { Medication } from "@/types/health";

type Profile = {
  chronicConditions: any[];
  medications: Medication[];
  allergies: string[];
  consultations: any[];
};

type MedicalProfileContextType = {
  profile: Profile;
  addAllergy: (allergy: string) => void;
  removeAllergy: (allergy: string) => void;
  removeChronicCondition: (id: string) => void;
  removeMedication: (id: string) => void;
  getUpcomingMedications: () => Medication[];
  userInfo: any;
  setUserInfo: (info: any) => void;
};

const MedicalProfileContext = createContext<MedicalProfileContextType | null>(null);

export const MedicalProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<Profile>({
    chronicConditions: [],
    medications: [],
    allergies: [],
    consultations: [],
  });

  // 👇 NEW: user info state
  const [userInfo, setUserInfo] = useState<any>(null);

  const addAllergy = (allergy: string) => {
    setProfile((prev) => ({ ...prev, allergies: [...prev.allergies, allergy] }));
  };

  const removeAllergy = (allergy: string) => {
    setProfile((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a !== allergy),
    }));
  };

  const removeChronicCondition = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      chronicConditions: prev.chronicConditions.filter((c: any) => c.id !== id),
    }));
  };

  const removeMedication = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      medications: prev.medications.filter((m: any) => m.id !== id),
    }));
  };

  const getUpcomingMedications = (): Medication[] => {
    const now = new Date();
    return profile.medications.filter((med) =>
      med.times.some((time) => {
        const [hours, minutes] = time.split(":").map(Number);
        const doseTime = new Date();
        doseTime.setHours(hours, minutes, 0, 0);
        return doseTime > now;
      })
    );
  };

  return (
    <MedicalProfileContext.Provider
      value={{
        profile,
        addAllergy,
        removeAllergy,
        removeChronicCondition,
        removeMedication,
        getUpcomingMedications,
        userInfo,
        setUserInfo,
      }}
    >
      {children}
    </MedicalProfileContext.Provider>
  );
};

export const useMedicalProfile = () => {
  const context = useContext(MedicalProfileContext);
  if (!context) {
    throw new Error("useMedicalProfile must be used within MedicalProfileProvider");
  }
  return context;
};
