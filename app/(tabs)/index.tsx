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
import { Send, AlertCircle, Sparkles, Camera } from 'lucide-react-native';
import { useMedicalProfile } from '@/contexts/medical-profile';
import type { Message, Consultation } from '@/types/health';
import CameraModal from '@/components/CameraModal';

export default function HealthCheckScreen() {
  const { profile, addConsultation } = useMedicalProfile();
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
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

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
      if (!apiKey) {
        throw new Error('Missing OpenAI API key. Set EXPO_PUBLIC_OPENAI_API_KEY.');
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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.disclaimer}>
        <AlertCircle size={16} color="#FF6B6B" />
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
    backgroundColor: '#F2F2F7',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#FF6B6B',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#00A896',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  assistantLabel: {
    fontSize: 12,
    color: '#00A896',
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    alignSelf: 'flex-start',
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  selectedImageContainer: {
    position: 'relative',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#1A1A1A',
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00A896',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
  },
});