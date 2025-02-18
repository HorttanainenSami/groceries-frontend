import {useEffect, useState, useContext } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {TaskType, loginResponse} from '@/types';
import { TaskContext } from '@/contexts/taskContext';


const useStorage = () => {
  const getUserFromStorage = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user):user;
    } catch (e) {
      console.log(e);
    }
  };
  const storeUserInStorage = async (user: loginResponse) => {
    try {
      await AsyncStorage.setItem('user',JSON.stringify(user));
    } catch (e) {
      console.log(e);
    }
  };
  const removeUserFromStorage = async () => {
    await AsyncStorage.removeItem('user'); 
  };
  return {
    getUserFromStorage,
    storeUserInStorage,
    removeUserFromStorage,
  };
};

export default useStorage;
