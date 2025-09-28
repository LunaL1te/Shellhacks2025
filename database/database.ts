import * as SQLite from 'expo-sqlite';

export interface DatabaseUser {
  id: string;
  name: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseChronicCondition {
  id: string;
  user_id: string;
  name: string;
  diagnosed_date: string;
  notes?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'inactive' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface DatabaseMedication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  side_effects?: string; // JSON string
  for_condition?: string;
  notes?: string;
  is_active: number; // SQLite uses 0/1 for boolean
  created_at: string;
  updated_at: string;
}

export interface DatabaseMedicationTime {
  id: string;
  medication_id: string;
  time: string;
  created_at: string;
}

export interface DatabaseAllergy {
  id: string;
  user_id: string;
  allergen: string;
  reaction_type?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseConsultation {
  id: string;
  user_id: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  recommendations?: string; // JSON string
  severity: 'low' | 'medium' | 'high';
  ai_model?: string;
  image_uri?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseVitalSign {
  id: string;
  user_id: string;
  date: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  notes?: string;
  created_at: string;
}

export interface DatabaseMedicalDocument {
  id: string;
  user_id: string;
  title: string;
  type: 'lab_result' | 'prescription' | 'scan' | 'other';
  file_uri: string;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAppointment {
  id: string;
  user_id: string;
  doctor_name?: string;
  specialty?: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  created_at: string;
  updated_at: string;
}

export interface DatabaseSurgery {
  id: string;
  user_id: string;
  name: string;
  date: string;
  surgeon?: string;
  hospital?: string;
  notes?: string;
  complications?: string; // JSON string
  recovery_time?: string;
  created_at: string;
  updated_at: string;
}

class MedicalDatabase {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await SQLite.openDatabaseAsync('medical_history.db');
      
      // Execute schema creation statements
      await this.createTables();

      this.isInitialized = true;
      console.log('Medical database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    const schemaStatements = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        date_of_birth TEXT,
        gender TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,

      // Chronic conditions table
      `CREATE TABLE IF NOT EXISTS chronic_conditions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        diagnosed_date TEXT NOT NULL,
        notes TEXT,
        severity TEXT CHECK(severity IN ('mild', 'moderate', 'severe')),
        status TEXT CHECK(status IN ('active', 'inactive', 'resolved')) DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Medications table
      `CREATE TABLE IF NOT EXISTS medications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        side_effects TEXT,
        for_condition TEXT,
        notes TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Medication times table
      `CREATE TABLE IF NOT EXISTS medication_times (
        id TEXT PRIMARY KEY,
        medication_id TEXT NOT NULL,
        time TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (medication_id) REFERENCES medications (id) ON DELETE CASCADE
      )`,

      // Allergies table
      `CREATE TABLE IF NOT EXISTS allergies (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        allergen TEXT NOT NULL,
        reaction_type TEXT,
        severity TEXT CHECK(severity IN ('mild', 'moderate', 'severe', 'life-threatening')),
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Consultations table
      `CREATE TABLE IF NOT EXISTS consultations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        symptoms TEXT NOT NULL,
        diagnosis TEXT NOT NULL,
        recommendations TEXT,
        severity TEXT CHECK(severity IN ('low', 'medium', 'high')) NOT NULL,
        ai_model TEXT,
        image_uri TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Vital signs table
      `CREATE TABLE IF NOT EXISTS vital_signs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        blood_pressure_systolic INTEGER,
        blood_pressure_diastolic INTEGER,
        heart_rate INTEGER,
        temperature REAL,
        weight REAL,
        height REAL,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Medical documents table
      `CREATE TABLE IF NOT EXISTS medical_documents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        file_uri TEXT NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Appointments table
      `CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        doctor_name TEXT,
        specialty TEXT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT,
        notes TEXT,
        status TEXT CHECK(status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Surgeries table
      `CREATE TABLE IF NOT EXISTS surgeries (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        surgeon TEXT,
        hospital TEXT,
        notes TEXT,
        complications TEXT,
        recovery_time TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // Create indexes
      `CREATE INDEX IF NOT EXISTS idx_chronic_conditions_user_id ON chronic_conditions(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_medications_active ON medications(is_active)`,
      `CREATE INDEX IF NOT EXISTS idx_medication_times_medication_id ON medication_times(medication_id)`,
      `CREATE INDEX IF NOT EXISTS idx_allergies_user_id ON allergies(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(date)`,
      `CREATE INDEX IF NOT EXISTS idx_vital_signs_user_id ON vital_signs(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_vital_signs_date ON vital_signs(date)`,
      `CREATE INDEX IF NOT EXISTS idx_medical_documents_user_id ON medical_documents(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date)`,
      `CREATE INDEX IF NOT EXISTS idx_surgeries_user_id ON surgeries(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_surgeries_date ON surgeries(date)`,
    ];

    for (const statement of schemaStatements) {
      await this.db.execAsync(statement);
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  // User operations
  async createUser(user: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    this.ensureInitialized();
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.db!.runAsync(
      `INSERT INTO users (id, name, email, date_of_birth, gender, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, user.name, user.email || null, user.date_of_birth || null, user.gender || null, now, now]
    );

    return id;
  }

  async getUser(userId: string): Promise<DatabaseUser | null> {
    this.ensureInitialized();
    const result = await this.db!.getFirstAsync<DatabaseUser>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    return result || null;
  }

  // Chronic conditions operations
  async createChronicCondition(condition: Omit<DatabaseChronicCondition, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    this.ensureInitialized();
    const id = `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.db!.runAsync(
      `INSERT INTO chronic_conditions (id, user_id, name, diagnosed_date, notes, severity, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, condition.user_id, condition.name, condition.diagnosed_date, condition.notes || null, 
       condition.severity || null, condition.status, now, now]
    );

    return id;
  }

  async getChronicConditions(userId: string): Promise<DatabaseChronicCondition[]> {
    this.ensureInitialized();
    return await this.db!.getAllAsync<DatabaseChronicCondition>(
      'SELECT * FROM chronic_conditions WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
  }

  async updateChronicCondition(id: string, updates: Partial<Omit<DatabaseChronicCondition, 'id' | 'user_id' | 'created_at'>>): Promise<void> {
    this.ensureInitialized();
    const now = new Date().toISOString();
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'user_id' && key !== 'created_at');
    const values = fields.map(field => updates[field as keyof typeof updates]);
    fields.push('updated_at');
    values.push(now);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    await this.db!.runAsync(
      `UPDATE chronic_conditions SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  async deleteChronicCondition(id: string): Promise<void> {
    this.ensureInitialized();
    await this.db!.runAsync('DELETE FROM chronic_conditions WHERE id = ?', [id]);
  }

  // Medications operations
  async createMedication(medication: Omit<DatabaseMedication, 'id' | 'created_at' | 'updated_at'>, times: string[]): Promise<string> {
    this.ensureInitialized();
    const id = `medication_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.db!.runAsync(
      `INSERT INTO medications (id, user_id, name, dosage, frequency, start_date, end_date, side_effects, for_condition, notes, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, medication.user_id, medication.name, medication.dosage, medication.frequency, 
       medication.start_date, medication.end_date || null, medication.side_effects || null,
       medication.for_condition || null, medication.notes || null, medication.is_active, now, now]
    );

    // Add medication times
    for (const time of times) {
      const timeId = `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.db!.runAsync(
        'INSERT INTO medication_times (id, medication_id, time, created_at) VALUES (?, ?, ?, ?)',
        [timeId, id, time, now]
      );
    }

    return id;
  }

  async getMedications(userId: string): Promise<(DatabaseMedication & { times: string[] })[]> {
    this.ensureInitialized();
    const medications = await this.db!.getAllAsync<DatabaseMedication>(
      'SELECT * FROM medications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Get times for each medication
    const medicationsWithTimes = await Promise.all(
      medications.map(async (med) => {
        const times = await this.db!.getAllAsync<DatabaseMedicationTime>(
          'SELECT time FROM medication_times WHERE medication_id = ? ORDER BY time',
          [med.id]
        );
        return {
          ...med,
          times: times.map(t => t.time)
        };
      })
    );

    return medicationsWithTimes;
  }

  async updateMedication(id: string, updates: Partial<Omit<DatabaseMedication, 'id' | 'user_id' | 'created_at'>>, times?: string[]): Promise<void> {
    this.ensureInitialized();
    const now = new Date().toISOString();
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'user_id' && key !== 'created_at');
    const values = fields.map(field => updates[field as keyof typeof updates]);
    fields.push('updated_at');
    values.push(now);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    await this.db!.runAsync(
      `UPDATE medications SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    // Update times if provided
    if (times) {
      await this.db!.runAsync('DELETE FROM medication_times WHERE medication_id = ?', [id]);
      for (const time of times) {
        const timeId = `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.db!.runAsync(
          'INSERT INTO medication_times (id, medication_id, time, created_at) VALUES (?, ?, ?, ?)',
          [timeId, id, time, now]
        );
      }
    }
  }

  async deleteMedication(id: string): Promise<void> {
    this.ensureInitialized();
    await this.db!.runAsync('DELETE FROM medications WHERE id = ?', [id]);
    await this.db!.runAsync('DELETE FROM medication_times WHERE medication_id = ?', [id]);
  }

  // Allergies operations
  async createAllergy(allergy: Omit<DatabaseAllergy, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    this.ensureInitialized();
    const id = `allergy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.db!.runAsync(
      `INSERT INTO allergies (id, user_id, allergen, reaction_type, severity, notes, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, allergy.user_id, allergy.allergen, allergy.reaction_type || null, 
       allergy.severity || null, allergy.notes || null, now, now]
    );

    return id;
  }

  async getAllergies(userId: string): Promise<DatabaseAllergy[]> {
    this.ensureInitialized();
    return await this.db!.getAllAsync<DatabaseAllergy>(
      'SELECT * FROM allergies WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
  }

  async deleteAllergy(id: string): Promise<void> {
    this.ensureInitialized();
    await this.db!.runAsync('DELETE FROM allergies WHERE id = ?', [id]);
  }

  // Consultations operations
  async createConsultation(consultation: Omit<DatabaseConsultation, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    this.ensureInitialized();
    const id = `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.db!.runAsync(
      `INSERT INTO consultations (id, user_id, date, symptoms, diagnosis, recommendations, severity, ai_model, image_uri, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, consultation.user_id, consultation.date, consultation.symptoms, consultation.diagnosis,
       consultation.recommendations || null, consultation.severity, consultation.ai_model || null,
       consultation.image_uri || null, now, now]
    );

    return id;
  }

  async getConsultations(userId: string): Promise<DatabaseConsultation[]> {
    this.ensureInitialized();
    return await this.db!.getAllAsync<DatabaseConsultation>(
      'SELECT * FROM consultations WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );
  }

  async getConsultation(id: string): Promise<DatabaseConsultation | null> {
    this.ensureInitialized();
    const result = await this.db!.getFirstAsync<DatabaseConsultation>(
      'SELECT * FROM consultations WHERE id = ?',
      [id]
    );
    return result || null;
  }

  async deleteConsultation(id: string): Promise<void> {
    this.ensureInitialized();
    await this.db!.runAsync('DELETE FROM consultations WHERE id = ?', [id]);
  }

  // Surgeries operations
  async createSurgery(surgery: Omit<DatabaseSurgery, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    this.ensureInitialized();
    const id = `surgery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.db!.runAsync(
      `INSERT INTO surgeries (id, user_id, name, date, surgeon, hospital, notes, complications, recovery_time, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, surgery.user_id, surgery.name, surgery.date, surgery.surgeon || null, surgery.hospital || null,
       surgery.notes || null, surgery.complications || null, surgery.recovery_time || null, now, now]
    );

    return id;
  }

  async getSurgeries(userId: string): Promise<DatabaseSurgery[]> {
    this.ensureInitialized();
    return await this.db!.getAllAsync<DatabaseSurgery>(
      'SELECT * FROM surgeries WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );
  }

  async getSurgery(id: string): Promise<DatabaseSurgery | null> {
    this.ensureInitialized();
    const result = await this.db!.getFirstAsync<DatabaseSurgery>(
      'SELECT * FROM surgeries WHERE id = ?',
      [id]
    );
    return result || null;
  }

  async updateSurgery(id: string, updates: Partial<Omit<DatabaseSurgery, 'id' | 'user_id' | 'created_at'>>): Promise<void> {
    this.ensureInitialized();
    const now = new Date().toISOString();
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'user_id' && key !== 'created_at');
    const values = fields.map(field => updates[field as keyof typeof updates]);
    fields.push('updated_at');
    values.push(now);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    await this.db!.runAsync(
      `UPDATE surgeries SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  async deleteSurgery(id: string): Promise<void> {
    this.ensureInitialized();
    await this.db!.runAsync('DELETE FROM surgeries WHERE id = ?', [id]);
  }

  // Utility methods
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
    }
  }

  async clearAllData(): Promise<void> {
    this.ensureInitialized();
    const tables = [
      'appointments', 'medical_documents', 'vital_signs', 'consultations', 
      'allergies', 'medication_times', 'medications', 'chronic_conditions', 'surgeries', 'users'
    ];
    
    for (const table of tables) {
      await this.db!.runAsync(`DELETE FROM ${table}`);
    }
  }
}

// Export singleton instance
export const medicalDatabase = new MedicalDatabase();
