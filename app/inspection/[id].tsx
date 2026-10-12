import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useInspectionDetail } from '@/src/features/inspections/hooks/useInspectionDetail';
import { useInspections } from '@/src/features/inspections/hooks/useInspections';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Trash2,
} from 'lucide-react-native';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';



export default function InspectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { inspection, isLoading } = useInspectionDetail(id as string);
  const { deleteInspection } = useInspections();

  
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Inspection',
      'Are you sure you want to delete this inspection record? This action will be queued locally.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await deleteInspection(id);
              router.back();
            }
          },
        },
      ]
    );
  };


  const handleLocation = async()=>{
    if(inspection?.latitude == null || inspection?.longitude == null) return

    const url = 
      `https://www.google.com/maps/search/?api=1&query=` +
      `${inspection.latitude},${inspection.longitude}`

    try{
      await Linking.openURL(url)
    }catch{
      Alert.alert('Map Error', 'Could not open the inspection location.')
    }
  }


  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!inspection) {
    return (
      <View style={styles.notFoundContainer}>
        <AlertCircle size={48} color="#EF4444" />
        <Text style={styles.notFoundTitle}>Inspection Not Found</Text>
        <Text style={styles.notFoundSubtitle}>
          The requested inspection record could not be located in local storage.
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        />
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
        <Text style={styles.headerTitle}>Inspection Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
          <Trash2 size={22} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Basic Info Card */}
        <Card style={styles.sectionCard}>
          <View style={styles.statusRow}>
            <Text style={styles.title}>{inspection.title}</Text>
            {inspection.status === 'synced' && (
              <View style={[styles.badge, styles.badgeSynced]}>
                <CheckCircle2 size={12} color="#166534" />
                <Text style={[styles.badgeText, styles.badgeTextSynced]}>Synced</Text>
              </View>
            )}
            {inspection.status === 'pending_sync' && (
              <View style={[styles.badge, styles.badgePending]}>
                <Clock size={12} color="#854D0E" />
                <Text style={[styles.badgeText, styles.badgeTextPending]}>Pending Sync</Text>
              </View>
            )}
            {inspection.status === 'draft' && (
              <View style={[styles.badge, styles.badgeDraft]}>
                <AlertCircle size={12} color="#374151" />
                <Text style={[styles.badgeText, styles.badgeTextDraft]}>Draft</Text>
              </View>
            )}
          </View>

          {inspection.description ? (
            <Text style={styles.description}>{inspection.description}</Text>
          ) : null}

          <View style={styles.metaRow}>
            <Calendar size={16} color="#64748B" />
            <Text style={styles.metaText}>
              {new Date(inspection.createdAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </Text>
          </View>
        </Card>

        {/* Location Section */}
        {inspection.latitude != null && inspection.longitude != null ? (
          <Pressable
            onPress={handleLocation}
            accessibilityRole='button'
            accessibilityLabel='Open inspection location map'
            >
            <Card style={styles.sectionCard}>
              <View style={styles.cardHeader}>
                <MapPin size={20} color="#2563EB" />
                <Text style={styles.sectionTitle}>Geolocation Meta</Text>
              </View>
              <Text style={styles.coordinateText}>
                Latitude: {inspection.latitude}
              </Text>
              <Text style={styles.coordinateText}>
                Longitude: {inspection.longitude}
              </Text>
            </Card>
          </Pressable>
        ) : null}

        {/* Photo Evidence Section */}
        {inspection.photoUri ? (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Photo Evidence</Text>
            <Image
              source={{ uri: inspection.photoUri }}
              style={styles.evidenceImage}
              resizeMode="cover"
            />
          </Card>
        ) : null}

        {/* Signature Evidence Section */}
        {inspection.signatureUri ? (
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <FileText size={20} color="#2563EB" />
              <Text style={styles.sectionTitle}>Digital Signature</Text>
            </View>
            <Image
              source={{ uri: inspection.signatureUri }}
              style={styles.signatureImage}
              resizeMode="contain"
            />
          </Card>
        ) : null}
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
    padding: 8,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  sectionCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 16,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  coordinateText: {
    fontSize: 14,
    color: '#334155',
    marginTop: 2,
  },
  evidenceImage: {
    width: '100%',
    height: 240,
    borderRadius: 8,
    marginTop: 8,
  },
  signatureImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeSynced: {
    backgroundColor: '#DCFCE7',
  },
  badgePending: {
    backgroundColor: '#FEF9C3',
  },
  badgeDraft: {
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextSynced: {
    color: '#166534',
  },
  badgeTextPending: {
    color: '#854D0E',
  },
  badgeTextDraft: {
    color: '#374151',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
});