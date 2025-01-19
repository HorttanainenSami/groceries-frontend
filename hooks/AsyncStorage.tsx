import {useEffect, useState, useContext } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {checkboxText} from '@/app/index';
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

  return {
    loading,
    getTasksFromStorage,
    storeTasksInStorage,
    editTasksInStorage
  };
};

export default useStorage;
