import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Send, AlertCircle, Sparkles, Camera, Heart } from 'lucide-react-native';
import { useMedicalProfile } from '@/contexts/medical-profile-database';
import type { Message, Consultation } from '@/types/health';
import CameraModal from '@/components/CameraModal';
import SetupInstructions from '@/components/SetupInstructions';
import DatabaseStatus from '@/components/DatabaseStatus';

export default function HealthCheckScreen() {
  const { profile, addConsultation, isLoading: profileLoading, isDatabaseReady } = useMedicalProfile();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI health assistant. How are you feeling today? Please describe any symptoms you're experiencing. You can also take photos to show me visual symptoms.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    // Check if API key is configured
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey || apiKey === '') {
      setShowSetup(true);
    }
  }, []);

  const generateMedicalContext = () => {
    let context = "Patient medical profile:\n";
    
    if (profile.chronicConditions.length > 0) {
      context += `Chronic conditions: ${profile.chronicConditions.map(c => c.name).join(', ')}\n`;
    }
    
    if (profile.medications.length > 0) {
      context += `Current medications: ${profile.medications.map(m => 
        `${m.name} (${m.dosage}, ${m.frequency}${m.sideEffects?.length ? `, known side effects: ${m.sideEffects.join(', ')}` : ''})`
      ).join('; ')}\n`;
    }
    
    if (profile.allergies.length > 0) {
      context += `Allergies: ${profile.allergies.join(', ')}\n`;
    }
    
    if (profile.surgeries.length > 0) {
      context += `Previous surgeries: ${profile.surgeries.map(s => 
        `${s.name} (${new Date(s.date).toLocaleDateString()}${s.surgeon ? `, performed by ${s.surgeon}` : ''}${s.complications?.length ? `, complications: ${s.complications.join(', ')}` : ''})`
      ).join('; ')}\n`;
    }
    
    return context;
  };

  const handlePhotoTaken = (uri: string) => {
    setSelectedImage(uri);
    setCameraModalVisible(false);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText || 'Photo of symptoms',
      timestamp: new Date().toISOString(),
      imageUri: selectedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const medicalContext = generateMedicalContext();

      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        setShowSetup(true);
        return;
      }

      // Prepare messages for API call
      const apiMessages: any[] = [
        {
          role: 'system',
          content: `You are a helpful AI health assistant. You provide general health information and guidance based on symptoms described and visual analysis of photos. 
          ${medicalContext}
          
          IMPORTANT GUIDELINES:
          1. Always remind users that this is not a replacement for professional medical advice
          2. Consider the patient's chronic conditions and medications when analyzing symptoms
          3. Identify if symptoms might be medication side effects
          4. Provide severity assessment (low, medium, high)
          5. Suggest when to seek immediate medical attention
          6. Be empathetic and supportive
          7. Format your response clearly with sections for: Assessment, Possible Causes, Recommendations
          8. Consider drug interactions if relevant
          9. When analyzing photos, describe what you see and how it might relate to symptoms
          10. Never provide definitive medical diagnoses based on photos alone`,
        },
        ...messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      ];

      // Add the current user message with or without image
      if (selectedImage) {
        apiMessages.push({
          role: 'user',
          content: [
            {
              type: 'text',
              text: inputText || 'Please analyze this photo of my symptoms',
            },
            {
              type: 'image_url',
              image_url: {
                url: selectedImage,
                detail: 'high',
              },
            },
          ],
        });
      } else {
        apiMessages.push({
          role: 'user',
          content: inputText,
        });
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: selectedImage ? 'gpt-4o' : 'gpt-4o-mini', // Use vision model for images
          messages: apiMessages,
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI error: ${errorText}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.';
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Extract severity from response (simple heuristic)
      let severity: 'low' | 'medium' | 'high' = 'low';
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes('emergency') || lowerContent.includes('immediate') || lowerContent.includes('urgent')) {
        severity = 'high';
      } else if (lowerContent.includes('consult') || lowerContent.includes('monitor')) {
        severity = 'medium';
      }

      // Save consultation
      const consultation: Consultation = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        symptoms: selectedImage ? `${inputText} [Photo attached]` : inputText,
        diagnosis: content.split('\n')[0] || 'General health inquiry',
        recommendations: content.match(/- (.*)/g)?.map((r: string) => r.replace('- ', '')) || [],
        severity,
      };
      
      addConsultation(consultation);

    } catch (error) {
      console.error('Error getting AI response:', error);
      Alert.alert('Error', 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSetup) {
    return (
      <SetupInstructions onSetupComplete={() => setShowSetup(false)} />
    );
  }

  if (profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A896" />
        <Text style={styles.loadingText}>Loading your medical profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <DatabaseStatus 
        isLoading={profileLoading} 
        isDatabaseReady={isDatabaseReady} 
      />
      
      <View style={styles.welcomeHeader}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>Welcome to AI Health Assistant</Text>
          <Text style={styles.welcomeSubtitle}>
            Describe your symptoms or take a photo for AI-powered health insights
          </Text>
        </View>
        <View style={styles.welcomeIcon}>
          <Heart size={32} color="#6366F1" />
        </View>
      </View>
      
      <View style={styles.disclaimer}>
        <AlertCircle size={16} color="#EF4444" />
        <Text style={styles.disclaimerText}>
          This is not a replacement for professional medical advice
        </Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            {message.role === 'assistant' && (
              <View style={styles.assistantHeader}>
                <Sparkles size={16} color="#00A896" />
                <Text style={styles.assistantLabel}>AI Assistant</Text>
              </View>
            )}
            {message.imageUri && (
              <Image source={{ uri: message.imageUri }} style={styles.messageImage} />
            )}
            <Text style={[
              styles.messageText,
              message.role === 'user' && styles.userMessageText,
            ]}>
              {message.content}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#00A896" />
            <Text style={styles.loadingText}>
              {selectedImage ? 'Analyzing your photo and symptoms...' : 'Analyzing your symptoms...'}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        {selectedImage && (
          <View style={styles.selectedImageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            <TouchableOpacity style={styles.removeImageButton} onPress={removeSelectedImage}>
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Describe your symptoms..."
            placeholderTextColor="#8E8E93"
            multiline
          />
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => setCameraModalVisible(true)}
          >
            <Camera size={20} color="#00A896" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendButton, ((!inputText.trim() && !selectedImage) || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={(!inputText.trim() && !selectedImage) || isLoading}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <CameraModal
        visible={cameraModalVisible}
        onClose={() => setCameraModalVisible(false)}
        onPhotoTaken={handlePhotoTaken}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    fontWeight: '400',
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    gap: 16,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 6,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  assistantLabel: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    fontWeight: '400',
  },
  userMessageText: {
    color: '#FFFFFF',
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
  inputContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedImageContainer: {
    position: 'relative',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  selectedImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 15,
    maxHeight: 120,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    fontWeight: '400',
  },
  cameraButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  messageImage: {
    width: 240,
    height: 240,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});