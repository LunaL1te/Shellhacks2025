import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, Camera, RotateCcw, Check } from 'lucide-react-native';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoTaken: (uri: string) => void;
}

export default function CameraModal({ visible, onClose, onPhotoTaken }: CameraModalProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            We need your permission to use the camera for taking photos of symptoms
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setCapturedImage(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const flipCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const usePicture = () => {
    if (capturedImage) {
      onPhotoTaken(capturedImage);
      setCapturedImage(null);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {!capturedImage ? (
          <>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
            >
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.controlButton} onPress={onClose}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
                
                <View style={styles.bottomControls}>
                  <TouchableOpacity style={styles.controlButton} onPress={flipCamera}>
                    <RotateCcw size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                    <Camera size={32} color="#FFFFFF" />
                  </TouchableOpacity>
                  
                  <View style={styles.controlButton} />
                </View>
              </View>
            </CameraView>
            
            <View style={styles.instructions}>
              <Text style={styles.instructionsText}>
                Position the camera over the area you'd like to show your healthcare provider
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            
            <View style={styles.previewControls}>
              <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.useButton} onPress={usePicture}>
                <Check size={20} color="#FFFFFF" />
                <Text style={styles.useButtonText}>Use Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#1A1A1A',
  },
  permissionButton: {
    backgroundColor: '#00A896',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00A896',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  instructions: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  instructionsText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewImage: {
    flex: 1,
    width: width,
    height: height,
    resizeMode: 'contain',
  },
  previewControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  useButton: {
    backgroundColor: '#00A896',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
