import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/brand';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export default function NotificationsScreen() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery(
    ['notifications'],
    () =>
      api
        .get('/notifications')
        .then((res) => res.data.data.notifications as Notification[]),
  );

  const markAllReadMutation = useMutation(
    () => api.post('/notifications/read-all').then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
      },
    }
  );

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={[styles.notificationCard, !item.isRead && styles.unread]}>
      <View style={styles.icon}>
        <Ionicons
          name={item.type === 'BOOKING_REQUEST' ? 'calendar' : item.type === 'PAYMENT_RECEIVED' ? 'card' : 'information-circle'}
          size={20}
          color={colors.primary}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications || []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="notifications-outline" size={48} color={colors.border} />
              <Text style={styles.empty}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
    headerTitle: { fontFamily: fonts.regular, fontSize: 24, fontWeight: 'bold', color: colors.text },
    markAll: { fontFamily: fonts.regular, fontSize: 14, color: colors.primary, fontWeight: '600' },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.white,
  },
  unread: { backgroundColor: colors.primaryTint },
  icon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: { flex: 1 },
    title: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginBottom: 2 },
    unreadTitle: { fontFamily: fonts.regular, fontWeight: 'bold', color: colors.text },
    message: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, lineHeight: 18 },
    time: { fontFamily: fonts.regular, fontSize: 11, color: colors.textSubtle, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    empty: { fontFamily: fonts.regular, fontSize: 16, color: colors.textSubtle, marginTop: 12 },
});
