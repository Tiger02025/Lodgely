import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/brand';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  university?: string;
  isVerified: boolean;
  universityVerified: boolean;
  phone?: string;
  profileImage?: string;
  bio?: string;
  createdAt: string;
}

export default function ProfileScreen() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');

  const { data: profile, isLoading } = useQuery(['profile'], () =>
    api.get('/users/profile').then((res) => res.data.data.user as UserProfile),
  );

  const updateProfileMutation = useMutation(
    (data: any) => api.patch('/users/profile', data).then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
      },
    }
  );

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({ bio, phone });
  };

  const handleLogout = () => {
    Alert.alert('Confirm', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          // Drop cached server state so the next user never sees the old session's data.
          queryClient.clear();
          logout();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        {profile?.profileImage ? (
          <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {profile?.firstName?.[0]}
              {profile?.lastName?.[0]}
            </Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>
            {profile?.firstName} {profile?.lastName}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{profile?.role}</Text>
          </View>
          <Text style={styles.email}>{profile?.email}</Text>
          {profile?.university && (
            <Text style={styles.university}>{profile.university}</Text>
          )}
          {profile?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color={colors.secondary} />
              <Text style={styles.verifiedText}>Verified Student</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <TextInput
          style={styles.bioInput}
          placeholder="Tell us about yourself..."
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.white,
  },
    title: { fontFamily: fonts.regular, fontSize: 24, fontWeight: 'bold', color: colors.text },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryTint },
    avatarText: { fontFamily: fonts.regular, fontWeight: 'bold', color: colors.primary, fontSize: 20 },
  info: { flex: 1, marginLeft: 16 },
    name: { fontFamily: fonts.regular, fontSize: 18, fontWeight: 'bold', color: colors.text },
  roleBadge: { backgroundColor: colors.primary, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
    roleText: { fontFamily: fonts.regular, color: colors.white, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
    email: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginTop: 4 },
    university: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSubtle, marginTop: 2 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    verifiedText: { fontFamily: fonts.regular, fontSize: 12, color: colors.secondary, fontWeight: '600', marginLeft: 2 },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: colors.divider },
    sectionTitle: { fontFamily: fonts.regular, fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
  bioInput: {
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: colors.white,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  input: {
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    margin: 20,
  },
    saveButtonText: { fontFamily: fonts.regular, color: colors.white, fontSize: 16, fontWeight: '600' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
    logoutText: { fontFamily: fonts.regular, color: colors.error, fontSize: 16, fontWeight: '600', marginLeft: 4 },
  spacer: { height: 40 },
});
