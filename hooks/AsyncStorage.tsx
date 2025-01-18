import {useEffect, useState } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {checkboxText} from '@/app/index';


const useStorage = () => {
  const [tasks, setTasks] = useState<checkboxText[]>([]);
  let loading = false; 
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      }catch(e) {
        console.log(e);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  },[])
  
  const editTasks = (newTasks: checkboxText[]) => {
    setTasks(newTasks);
    storeTasks(newTasks);
  };
  const getTasks = async () => {
    loading = true;
    try{
      const response = await AsyncStorage.getItem('tasks');
      return response ? JSON.parse(response):response;
    } catch (e) {
      console.log(e);
    }finally {
    loading = false;
    }
  }
  const storeTasks = async (value: checkboxText[]) => {
    try {
      await AsyncStorage.setItem('tasks',JSON.stringify(value));
    } catch (e) {
      console.log(e);
    }
  }

  return {
    tasks,
    loading,
    getTasks,
    storeTasks,
    editTasks
  };
};

export default useStorage;
