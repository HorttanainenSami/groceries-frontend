import { Keyboard, StyleSheet, Button, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthenticationContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/FormInput';
import { LoginType, LoginSchema } from '@/types';

export default function Index() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const { login } = useAuth();

  const onSubmit = async (data: LoginType) => {
    try {
      const response = await login(data);
      router.navigate('/');
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <Text> Login view </Text>
      <FormInput<LoginType>
        name="email"
        keyboardType="email-address"
        control={control}
        textContentType="emailAddress"
        placeholder="email"
      />
      <FormInput<LoginType>
        placeholder="password"
        textContentType="password"
        name="password"
        secureTextEntry={true}
        control={control}
        autoCapitalize="none"
      />

      <Button
        title="Login"
        onPress={handleSubmit((data) => {
          Keyboard.dismiss();
          onSubmit(data);
        })}
      />
      <Button
        title="Register a new account"
        onPress={() => {
          router.navigate('/register');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    flexGrow: 2,
    fontSize: 24,
  },
  show: {
    opacity: 100,
  },
  container: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  textPressable: {
    flexGrow: 2,
  },
  text: {
    fontSize: 18,
    textDecorationLine: 'none',
    color: '#000',
  },
  textCheckboxActive: {
    textDecorationLine: 'line-through',
    color: '#555',
  },
  selectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: 0,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});
