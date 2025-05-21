import { Keyboard, StyleSheet, Button, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthenticationContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/FormInput';
import { RegisterType, RegisterSchema } from '@/types';

export default function Index() {
  const router = useRouter();
  const { signup } = useAuth();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (credentials: RegisterType) => {
    try {
      const response = await signup(credentials);
      router.navigate('/signin');
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <Text> Register view </Text>
      <FormInput<RegisterType>
        name="email"
        keyboardType="email-address"
        control={control}
        textContentType="emailAddress"
        placeholder="email"
      />
      <FormInput<RegisterType>
        name="name"
        control={control}
        textContentType="name"
        placeholder="name"
      />
      <FormInput<RegisterType>
        placeholder="password"
        textContentType="password"
        name="password"
        secureTextEntry={true}
        control={control}
        autoCapitalize="none"
      />
      <FormInput<RegisterType>
        placeholder="password"
        textContentType="password"
        name="confirm"
        secureTextEntry={true}
        control={control}
        autoCapitalize="none"
      />

      <Button
        title="Register"
        onPress={handleSubmit((data) => {
          Keyboard.dismiss();
          onSubmit(data);
        })}
      />
      <Button
        title="Allready have a account?"
        onPress={() => {
          router.navigate('/signin');
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
