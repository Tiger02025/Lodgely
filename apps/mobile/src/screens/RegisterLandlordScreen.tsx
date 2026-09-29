import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useMutation } from 'react-query';
import api from '../services/api';
import { colors, fonts } from '../theme/brand';

export default function RegisterLandlordScreen({ navigation }: any) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    propertyAddress: '',
  });

  const registerMutation = useMutation(
    (data: any) =>
      api.post('/auth/register/landlord', data).then(() => {
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
    if (!form.email || !form.password || !form.firstName || !form.lastName || !form.propertyAddress) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    registerMutation.mutate(form);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Landlord Sign Up</Text>

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
          placeholder="Phone"
          value={form.phone}
          onChangeText={(t) => setForm({ ...form, phone: t })}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Property Address (for verification)"
          value={form.propertyAddress}
          onChangeText={(t) => setForm({ ...form, propertyAddress: t })}
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
});
