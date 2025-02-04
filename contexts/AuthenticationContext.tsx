import { useContext, createContext, useState} from 'react';
import {loginAPI} from '@/service/database';
import { LoginType } from '@/app/signin';
import { ErrorResponse, ErrorResponseSchema, loginResponse } from '../types';

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
  const login = async ( credentials: LoginType) => {
    try{
      const response = await loginAPI(credentials);
      setUser(response)
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
  };

  return (
    <AuthContext.Provider value={{error: error, user:user, login:login, logout:logout}}>
      {children}
    </AuthContext.Provider>
  );

};


export const useAuth = () => useContext(AuthContext);
