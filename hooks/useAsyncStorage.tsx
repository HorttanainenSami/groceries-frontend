import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginResponseType } from '@groceries/shared_types';

const useStorage = () => {
  const getUserFromStorage = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : user;
    } catch (e) {
      console.log(e);
    }
  };
  const storeUserInStorage = async (user: LoginResponseType) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
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
