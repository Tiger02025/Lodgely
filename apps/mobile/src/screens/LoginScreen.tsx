import { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useMutation } from 'react-query';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { colors, fonts } from '../theme/brand';
import logo from '../assets/logo.png';


export default function LoginScreen({ navigation }: any) {
  const { setToken, setUser } = useAuth();
  const [email, setEmail] = useState('student@demo.com');
  const [password, setPassword] = useState('password123');

  const loginMutation = useMutation(
    (data: any) => api.post('/auth/login', data).then((res) => res.data.data),
    {
      onSuccess: async ({ accessToken, user }) => {
        await setToken(accessToken);
        await setUser(user);
      },
      onError: () => {
        Alert.alert('Login Failed', 'Please check your credentials');
      },
    }
  );

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.subtitle}>Student Accommodation Platform</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {loginMutation.isError && (
          <Text style={styles.errorText}>Invalid email or password</Text>
        )}

        <TouchableOpacity
          style={[styles.button, loginMutation.isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loginMutation.isLoading}
        >
          <Text style={styles.buttonText}>
            {loginMutation.isLoading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('RegisterStudent')}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>Don&apos;t have an account? Sign up as Student</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('RegisterLandlord')}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>Are you a landlord? Register here</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
    logoImage: { width: 200, height: 141, marginBottom: 8 },
    title: { fontFamily: fonts.brand, fontSize: 32, fontWeight: 'bold', color: colors.primary },
    subtitle: { fontFamily: fonts.regular, fontSize: 16, color: colors.textMuted, marginTop: 4 },
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
