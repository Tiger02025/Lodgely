import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useMutation } from 'react-query';
import api from '../services/api';
import { colors, fonts } from '../theme/brand';

export default function RegisterStudentScreen({ navigation }: any) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    university: '',
    studentId: '',
    phone: '',
  });
  const [showStudentId, setShowStudentId] = useState(false);

  const registerMutation = useMutation(
    (data: any) =>
      api.post('/auth/register/student', data).then(() => {
        Alert.alert('Success', 'Registration successful. Please login.', [
          { onPress: () => navigation.navigate('Login') },
        ]);
      }),
    {
      onError: () => {
        Alert.alert('Error', 'Registration failed. Please try again.');
      },
    }
  );

  const handleSubmit = () => {
    if (!form.email || !form.password || !form.firstName || !form.lastName || !form.university) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    registerMutation.mutate({
      ...form,
      studentId: form.studentId || undefined,
      phone: form.phone || undefined,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Student Sign Up</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={form.email}
          onChangeText={(t) => setForm({ ...form, email: t })}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min 8 characters)"
          value={form.password}
          onChangeText={(t) => setForm({ ...form, password: t })}
          secureTextEntry
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfWidth]}
            placeholder="First Name"
            value={form.firstName}
            onChangeText={(t) => setForm({ ...form, firstName: t })}
          />
          <TextInput
            style={[styles.input, styles.halfWidth]}
            placeholder="Last Name"
            value={form.lastName}
            onChangeText={(t) => setForm({ ...form, lastName: t })}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="University"
          value={form.university}
          onChangeText={(t) => setForm({ ...form, university: t })}
        />
        <TouchableOpacity
          onPress={() => setShowStudentId(!showStudentId)}
          style={styles.checkboxRow}
        >
          <Text style={styles.checkbox}>{showStudentId ? '✓' : '○'}</Text>
          <Text style={styles.checkboxLabel}>Add Student ID</Text>
        </TouchableOpacity>
        {showStudentId && (
          <TextInput
            style={styles.input}
            placeholder="Student ID Number"
            value={form.studentId}
            onChangeText={(t) => setForm({ ...form, studentId: t })}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Phone (optional)"
          value={form.phone}
          onChangeText={(t) => setForm({ ...form, phone: t })}
          keyboardType="phone-pad"
        />

        {registerMutation.isError && (
          <Text style={styles.errorText}>Registration failed</Text>
        )}

        <TouchableOpacity
          style={[styles.button, registerMutation.isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={registerMutation.isLoading}
        >
          <Text style={styles.buttonText}>
            {registerMutation.isLoading ? 'Creating...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 24, paddingTop: 60 },
    title: { fontFamily: fonts.regular, fontSize: 28, fontWeight: 'bold', color: colors.primary, marginBottom: 24, textAlign: 'center' },
  form: { width: '100%' },
  input: {
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  halfWidth: { flex: 1 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: colors.primarySoft },
    buttonText: { fontFamily: fonts.regular, color: colors.white, fontSize: 16, fontWeight: '600' },
  linkButton: { marginTop: 16, alignItems: 'center' },
    linkText: { fontFamily: fonts.regular, color: colors.primary, fontSize: 14 },
    errorText: { fontFamily: fonts.regular, color: colors.error, textAlign: 'center', marginBottom: 8 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    checkbox: { fontFamily: fonts.regular, fontSize: 20, marginRight: 8, color: colors.primary },
    checkboxLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.text },
});
