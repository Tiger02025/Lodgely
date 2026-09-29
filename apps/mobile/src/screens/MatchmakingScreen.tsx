import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { MatchStatus } from '../types/enums';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/brand';

interface Match {
  id: string;
  userAId: string;
  userBId: string;
  score: number;
  reasons: string[];
  status: MatchStatus;
  createdAt: string;
  userA: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    university?: string;
    profileImage?: string;
  };
  userB: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    university?: string;
    profileImage?: string;
  };
}

export default function MatchmakingScreen() {
  const queryClient = useQueryClient();

  const { data: matches, isLoading, refetch } = useQuery(
    ['matches'],
    () => api.get('/matching').then((res) => res.data.data.matches as Match[]),
  );

  const requestMatchMutation = useMutation(
    () => api.post('/matching/request').then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('matches');
      },
    }
  );

  const respondMutation = useMutation(
    ({ matchId, accept }: { matchId: string; accept: boolean }) =>
      api.patch(`/matching/${matchId}/respond`, { accept }).then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('matches');
      },
    }
  );

  const handleRefresh = () => {
    if (!matches || matches.length === 0 || 
        matches.every((m) => m.status === MatchStatus.REJECTED)) {
      requestMatchMutation.mutate();
    } else {
      refetch();
    }
  };

  const handleAccept = (matchId: string) => {
    respondMutation.mutate({ matchId, accept: true });
  };

  const handleReject = (matchId: string) => {
    respondMutation.mutate({ matchId, accept: false });
  };

  const renderMatch = ({ item: match }: { item: Match }) => {
    const otherUser = match.userB;
    const isMatchAccepted = match.status === MatchStatus.ACCEPTED;
    const isMatchRejected = match.status === MatchStatus.REJECTED;

    return (
      <View style={styles.matchCard}>
        <View style={styles.matchHeader}>
          {otherUser?.profileImage ? (
            <Image source={{ uri: otherUser.profileImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {otherUser?.firstName[0]}
                {otherUser?.lastName[0]}
              </Text>
            </View>
          )}
          <View style={styles.matchInfo}>
            <Text style={styles.matchName}>
              {otherUser?.firstName} {otherUser?.lastName}
            </Text>
            <Text style={styles.matchUniversity}>{otherUser?.university}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{(match.score * 100).toFixed(0)}%</Text>
          </View>
        </View>

        <View style={styles.reasons}>
          {match.reasons.map((reason, i) => (
            <View key={i} style={styles.reasonChip}>
              <Ionicons name="checkmark-circle" size={14} color={colors.secondary} />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>

        {!isMatchAccepted && !isMatchRejected && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAccept(match.id)}
            >
              <Ionicons name="checkmark" size={20} color={colors.white} />
              <Text style={styles.actionText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(match.id)}
            >
              <Ionicons name="close" size={20} color={colors.white} />
              <Text style={styles.actionText}>Skip</Text>
            </TouchableOpacity>
          </View>
        )}

        {isMatchAccepted && (
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
            <Text style={styles.statusText}>Connected</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Roommate Matchmaking</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        We&apos;ll find compatible roommates near your university
      </Text>

      {isLoading ? (
        <View style={styles.center}>
          <Text>Finding matches...</Text>
        </View>
      ) : (
        <FlatList
          data={matches || []}
          keyExtractor={(item) => item.id}
          renderItem={renderMatch}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>No matches yet</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => requestMatchMutation.mutate()}
                disabled={requestMatchMutation.isLoading}
              >
                <Text style={styles.buttonText}>
                  {requestMatchMutation.isLoading ? 'Finding...' : 'Find Roommates'}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    headerTitle: { fontFamily: fonts.regular, fontSize: 24, fontWeight: 'bold', color: colors.text },
    subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginBottom: 16 },
  matchCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  matchHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryTint },
    avatarText: { fontFamily: fonts.regular, fontWeight: 'bold', color: colors.primary },
  matchInfo: { flex: 1 },
    matchName: { fontFamily: fonts.regular, fontSize: 16, fontWeight: '600', color: colors.text },
    matchUniversity: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  scoreBadge: { backgroundColor: colors.primary, width: 56, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    scoreText: { fontFamily: fonts.regular, color: colors.white, fontSize: 12, fontWeight: 'bold' },
  reasons: { marginBottom: 12, gap: 4 },
  reasonChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryTint, padding: 6, borderRadius: 8 },
    reasonText: { fontFamily: fonts.regular, fontSize: 12, color: colors.primaryMid, marginLeft: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8 },
  acceptButton: { backgroundColor: colors.secondary },
  rejectButton: { backgroundColor: colors.error },
    actionText: { fontFamily: fonts.regular, color: colors.white, fontWeight: '600', marginLeft: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 8 },
    statusText: { fontFamily: fonts.regular, color: colors.secondary, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    empty: { fontFamily: fonts.regular, fontSize: 16, color: colors.textSubtle, marginBottom: 16 },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center' },
    buttonText: { fontFamily: fonts.regular, color: colors.white, fontSize: 16, fontWeight: '600' },
});
