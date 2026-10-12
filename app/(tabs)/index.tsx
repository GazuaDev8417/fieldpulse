import { Card } from '@/src/components/ui/Card';
import { Inspection } from '@/src/database/schema';
import { useInspections } from '@/src/features/inspections/hooks/useInspections';
import { Href, useRouter } from 'expo-router';
import { AlertCircle, CheckCircle2, Clock, Plus } from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';



export default function InspectionFeedScreen(){
    const router = useRouter()
    const { inspections, isLoading, refetch } = useInspections()

    const renderStatusBadge = (status:Inspection['status']) =>{
        switch(status){
            case 'synced':
                return(
                    <View style={[styles.badge, styles.badgeSynced]}>
                        <CheckCircle2 size={12} color="#166534" />
                        <Text style={[styles.badgeText, styles.badgeTextSynced]}>Synced</Text>
                    </View>
                )
            case 'pending_sync':
                return(
                    <View style={[styles.badge, styles.badgePending]}>
                        <Clock size={12} color="#854D0E" />
                        <Text style={[styles.badgeText, styles.badgeTextPending]}>Saved locally</Text>
                    </View>
                )
            default:
                return(
                    <View style={[styles.badge, styles.badgeDraft]}>
                        <AlertCircle size={12} color="#374151" />
                        <Text style={[styles.badgeText, styles.badgeTextDraft]}>Draft</Text>
                    </View>
                )
        }
    }

    const renderInspectionItem = ({ item }: { item:Inspection }) =>(
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push(`/inspection/${item.id}` as Href)}
            >
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                {renderStatusBadge(item.status)}
                </View>

                {item.description ? (
                <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                </Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <Text style={styles.cardDate}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      })}
                  </Text>
                  {item.latitude && item.longitude ? (
                      <Text style={styles.cardCoordinates}>
                      GPS: {item.latitude.toFixed(3)}, {item.longitude.toFixed(3)}
                      </Text>
                  ) : null}
                </View>
            </Card>
        </TouchableOpacity>
    )

    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Inspections</Text>
                    <Text style={styles.headerSubtitle}>Field Operations & Audits</Text>
                </View>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push('/inspection/new' as Href)}
                    activeOpacity={0.8}
                >
                  <Plus size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                  data={inspections}
                  keyExtractor={(item) => item.id}
                  renderItem={renderInspectionItem}
                  contentContainerStyle={styles.listContent}
                  refreshControl={
                      <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                  }
                  ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                      <Text style={styles.emptyTitle}>No inspections found</Text>
                      <Text style={styles.emptySubtitle}>
                          Tap the + button to create your first field inspection.
                      </Text>
                      </View>
                  }
                />
            )}
        </View>
    )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  cardCoordinates: {
    fontSize: 12,
    color: '#64748B',
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
})