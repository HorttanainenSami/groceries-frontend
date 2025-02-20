import {useLayoutEffect, useContext, createContext, useState} from 'react';
import {loginAPI, signupAPI} from '@/service/database';
import { LoginType, RegisterType } from '@/types';
import useStorage from '@/hooks/AsyncStorage'
import { ErrorResponse, ErrorResponseSchema, loginResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAlert } from '@/contexts/AlertContext';

type authContextProps = {
  user: loginResponse|undefined,
  login: (credentials: LoginType) => void,
  logout: () => void,
  signup: (credentials: RegisterType) => void,
};
export const AuthContext = createContext<authContextProps>(
  {
    logout: () => {},
    user: undefined,
    login: () => {},
    signup: () => {}
  });


export const AuthContextProvider = ({children} : React.PropsWithChildren) => {
  const { addAlert } = useAlert();
  const [user, setUser] = useState<loginResponse>();
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
        console.log('parsed error');
        addAlert({message: parsedError.data.error, type: 'error'} );
      } else {
        console.log('error occurred');
        addAlert({message: 'error occurred', type: 'error'});
      }
      throw e;
    }
  };
  const logout = () => {
    setUser(undefined);
    removeUserFromStorage();
  };

  const signup = async ( credentials: RegisterType) => {
    try{
      const response = await signupAPI(credentials);
      return true;
    }catch(e){
      const parsedError = ErrorResponseSchema.safeParse(e);
      if(parsedError.success) {
        console.log('parsed error');
        addAlert({message: parsedError.data.error, type: 'error'} );
      } else {
        console.log('error occurred');
        addAlert({message: 'error occurred', type: 'error'});
      }
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{user:user, login:login, logout:logout, signup}}>
      {children}
    </AuthContext.Provider>
  );

};


export const useAuth = () => useContext(AuthContext);
