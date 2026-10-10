import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { useInspections } from '@/src/features/inspections/hooks/useInspections';
import { zodResolver } from '@hookform/resolvers/zod';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Camera, Check, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { z } from 'zod';



const inspectionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().optional(),
});

type InspectionFormData = z.infer<typeof inspectionSchema>;

export default function NewInspectionScreen() {
  const router = useRouter();
  const { createInspection, isCreating } = useInspections();

  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const handleFetchLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied.');
        setIsGettingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Location Error', 'Could not fetch current device coordinates.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleTakePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setShowCamera(false);
      }
    }
  };

  const onSubmit = async (data: InspectionFormData) => {
    try {
      const newId = `insp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await createInspection({
        id: newId,
        title: data.title,
        description: data.description ?? null,
        status: 'pending_sync',
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        photoUri: photoUri ?? null,
        signatureUri: null,
      });

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save the inspection record locally.');
    }
  };

  if (showCamera) {
    if (!permission?.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need your permission to use the camera</Text>
          <Button title="Grant Permission" onPress={requestPermission} />
          <Button title="Cancel" variant="outline" onPress={() => setShowCamera(false)} style={{ marginTop: 8 }} />
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} ref={(ref) => setCameraRef(ref)}/>
        <View style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.captureButton} onPress={handleTakePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeCameraButton} onPress={() => setShowCamera(false)}>
            <Text style={styles.closeCameraText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Inspection</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.formCard}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Inspection Title *"
                placeholder="e.g. Electrical Panel Audit - Block B"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.title?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Description & Notes"
                placeholder="Detailed findings or remarks..."
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.description?.message}
              />
            )}
          />
        </Card>

        {/* GPS Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Geolocation</Text>
          </View>

          {location ? (
            <View style={styles.locationInfo}>
              <Check size={16} color="#166534" />
              <Text style={styles.locationText}>
                Lat: {location.latitude.toFixed(5)}, Long: {location.longitude.toFixed(5)}
              </Text>
            </View>
          ) : (
            <Button
              title={isGettingLocation ? 'Fetching GPS...' : 'Capture GPS Location'}
              variant="outline"
              size="sm"
              isLoading={isGettingLocation}
              onPress={handleFetchLocation}
            />
          )}
        </Card>

        {/* Camera Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Camera size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Photo Evidence</Text>
          </View>

          {photoUri ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => setShowCamera(true)}
              >
                <Text style={styles.retakeText}>Retake Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              title="Take Photo"
              variant="outline"
              size="sm"
              onPress={() => setShowCamera(true)}
            />
          )}
        </Card>

        <Button
          title="Save Inspection"
          isLoading={isCreating}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  iconButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  formCard: {
    padding: 16,
  },
  sectionCard: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 6,
    gap: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '500',
  },
  photoPreviewContainer: {
    alignItems: 'center',
    gap: 8,
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  retakeButton: {
    paddingVertical: 6,
  },
  retakeText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#000000',
  },
  closeCameraButton: {
    marginTop: 20,
  },
  closeCameraText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#334155',
  },
});