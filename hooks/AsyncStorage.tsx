import {useEffect, useState, useContext } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {checkboxText, loginResponse} from '@/types';
import { TaskContext } from '@/contexts/taskContext';


const useStorage = () => {
  let loading = true; 
  
  const editTasksInStorage = (newTasks: checkboxText[]) => {
    storeTasksInStorage(newTasks);
  };
  const getTasksFromStorage = async (): Promise<checkboxText[]> => {
    loading = true;
    try{
      const response = await AsyncStorage.getItem('tasks');
      return response ? JSON.parse(response):response;
    } catch (e) {
      console.log(e);
      throw e;
    }finally {
    loading = false;
    }
  }
  const storeTasksInStorage = async (value: checkboxText[]) => {
    try {
      await AsyncStorage.setItem('tasks',JSON.stringify(value));
    } catch (e) {
      console.log(e);
    }
  }
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
    loading,
    getTasksFromStorage,
    storeTasksInStorage,
    editTasksInStorage,
    getUserFromStorage,
    storeUserInStorage,
    removeUserFromStorage,
  };
};

export default useStorage;
