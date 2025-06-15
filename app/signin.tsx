import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import useAuth from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/FormInput';
import { LoginType, LoginSchema } from '@/types';
import useAlert from '@/hooks/useAlert';
import React from 'react';

export default function LoginScreen() {
  const router = useRouter();
  const { login, user } = useAuth();
  const {addAlert} = useAlert();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
React.useLayoutEffect(() => {
    if(user) {
      router.navigate('/'); // Redirect to home if user is already logged in
    }
  }, [user])
  const onSubmit = async (credentials: LoginType) => {
    try {
      await login(credentials);
      router.navigate('/');
    } catch (e) {
      addAlert({
        message: 'Tarkista sähköposti ja salasana.',
        type: 'error',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Kirjaudu sisään</Text>
      <View style={styles.form}>
        <FormInput<LoginType>
          name="email"
          keyboardType="email-address"
          control={control}
          textContentType="emailAddress"
          placeholder="Sähköposti"
        />
        <FormInput<LoginType>
          placeholder="Salasana"
          textContentType="password"
          name="password"
          secureTextEntry={true}
          control={control}
          autoCapitalize="none"
        />

        <Pressable
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit((data) => {
            Keyboard.dismiss();
            onSubmit(data);
          })}
          disabled={isSubmitting}>
          <Text style={styles.buttonText}>Kirjaudu</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />
      <Pressable
        style={styles.linkButton}
        onPress={() => router.navigate('/register')}>
        <Text style={styles.linkText}>
          Eikö sinulla ole tiliä? Luo uusi tili
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#1e88e5',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
  },
  error: {
    color: '#e53935',
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 2,
  },
  button: {
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#b3c6e6',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 18,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: '#1e88e5',
    fontSize: 16,
    fontWeight: '500',
  },
});
