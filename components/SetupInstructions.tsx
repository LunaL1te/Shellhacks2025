import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { ExternalLink, Key, AlertCircle } from 'lucide-react-native';

interface SetupInstructionsProps {
  onSetupComplete: () => void;
}

export default function SetupInstructions({ onSetupComplete }: SetupInstructionsProps) {
  const handleOpenOpenAI = () => {
    Linking.openURL('https://platform.openai.com/api-keys');
  };

  const handleSetupComplete = () => {
    Alert.alert(
      'Setup Complete',
      'Please restart the app after setting your API key in the .env file.',
      [
        { text: 'OK', onPress: onSetupComplete }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Key size={48} color="#00A896" />
        <Text style={styles.title}>AI Setup Required</Text>
        <Text style={styles.subtitle}>
          To use the AI diagnostic features, you need to configure your OpenAI API key.
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Setup Steps:</Text>
        
        <View style={styles.step}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.stepText}>
            Get your API key from OpenAI
          </Text>
          <TouchableOpacity style={styles.linkButton} onPress={handleOpenOpenAI}>
            <ExternalLink size={16} color="#00A896" />
            <Text style={styles.linkText}>Open OpenAI Platform</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.stepText}>
            Open the .env file in your project root
          </Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>3</Text>
          <Text style={styles.stepText}>
            Replace 'your_openai_api_key_here' with your actual API key
          </Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>4</Text>
          <Text style={styles.stepText}>
            Restart the app
          </Text>
        </View>
      </View>

      <View style={styles.warning}>
        <AlertCircle size={16} color="#FF6B6B" />
        <Text style={styles.warningText}>
          Keep your API key secure and never share it publicly.
        </Text>
      </View>

      <TouchableOpacity style={styles.completeButton} onPress={handleSetupComplete}>
        <Text style={styles.completeButtonText}>I've Set Up My API Key</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  instructions: {
    marginBottom: 30,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00A896',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    gap: 4,
  },
  linkText: {
    color: '#00A896',
    fontSize: 14,
    fontWeight: '500',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 30,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#FF6B6B',
    lineHeight: 18,
  },
  completeButton: {
    backgroundColor: '#00A896',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
