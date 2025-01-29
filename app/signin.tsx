import { TextInput, StyleSheet, Pressable, Button, FlatList, Text, View } from "react-native";
import Checkbox from '@/components/Checkbox';
import TaskCreateModal from '@/components/TaskCreateModal';
import TaskEditModal from '@/components/TaskEditModal';
import { useLayoutEffect, useState } from "react";
import { useRouter, useNavigation } from 'expo-router';
import IconButton from "@/components/IconButton";
import useStorage from '@/hooks/AsyncStorage';
import { useTaskStorage } from "@/contexts/taskContext";
import { useAuth } from "@/contexts/AuthenticationContext";
import {z} from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import FormInput from "@/components/FormInput";
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3, 'Password must be atleast 3 characters long'),
});
type LoginType = z.infer<typeof LoginSchema>;
export default function Index() {
  const router = useRouter();
  const navigation = useNavigation();
  const data  = useAuth();
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
    }
  })

    const onSubmit= (data: LoginType) => {
      console.log('submit', data);
    };
  
  return (
      <View
        style={styles.container}
      >
      <Text> Login view </Text>
      <FormInput<LoginType>
        name='email'
        keyboardType='email-address'
        control={control}
        textContentType='emailAddress'
        placeholder='email'
    
      />
      <FormInput<LoginType>
        placeholder='password'
        textContentType='password'
        name='password'
        secureTextEntry={true}
        control={control}
      />
    
      <Button title='Login' onPress={handleSubmit(onSubmit)}/>
      <Button title='Register a new account' onPress={() =>{}}/>

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
  itemContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  textPressable : {
    flexGrow: 2
  },
  text: {
    fontSize: 18,
    textDecorationLine:'none',
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

