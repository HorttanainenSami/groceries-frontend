import {useLayoutEffect, useContext, createContext, useState} from 'react';
import {loginAPI} from '@/service/database';
import { LoginType } from '@/app/signin';
import useStorage from '@/hooks/AsyncStorage'
import { ErrorResponse, ErrorResponseSchema, loginResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type authContextProps = {
  user: loginResponse|undefined,
  login: (credentials: LoginType) => Promise<boolean>,
  logout: () => void,
  error: string|undefined,
};
export const AuthContext = createContext<authContextProps>({error: undefined, logout: () => {}, user: undefined, login: (credential:LoginType) => new Promise((res, rej) => res(true))});


export const AuthContextProvider = ({children} : React.PropsWithChildren) => {
  const [user, setUser] = useState<loginResponse>();
  const [error, setError] = useState<string>();
  const {getUserFromStorage, storeUserInStorage, removeUserFromStorage}= useStorage();

  useLayoutEffect(() => {
    const fetchUser = async () => {
      const response = await getUserFromStorage();
      setUser(response);
    }
    fetchUser();
  },[]);

  const login = async ( credentials: LoginType) => {
    try{
      const response = await loginAPI(credentials);
      setUser(response)
      storeUserInStorage(response);
      return true;
    }catch(e){
      const parsedError = ErrorResponseSchema.safeParse(e);
      if(parsedError.success) {
        setError(parsedError.data.error);
      } else {
        setError('error occurred');
      }
      throw e;
    }
  };
  const logout = () => {
    setUser(undefined);
    removeUserFromStorage();
  };

  return (
    <AuthContext.Provider value={{error: error, user:user, login:login, logout:logout}}>
      {children}
    </AuthContext.Provider>
  );

};


export const useAuth = () => useContext(AuthContext);
