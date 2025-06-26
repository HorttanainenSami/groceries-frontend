import { useLayoutEffect } from 'react';
import { LoginType, RegisterType } from '@/types';
import useStorage from '@/hooks/useAsyncStorage';
import { ErrorResponseSchema } from '../types';
import useAlert from '@/hooks/useAlert';
import { loginAPI, signupAPI } from '@/service/database';
import { isAxiosError, AxiosError } from 'axios';
import { getAxiosInstance } from '@/service/AxiosInstance';
import { useAuthContext } from '@/contexts/AuthenticationContext';

const useAuth = () => {
  const { user, setUser } = useAuthContext();
  const { addAlert } = useAlert();
  const { getUserFromStorage, storeUserInStorage, removeUserFromStorage } =
    useStorage();

  useLayoutEffect(() => {
    const tokenBearer = getAxiosInstance().interceptors.request.use(
      (config) => {
        if (user) {
          config.headers['Authorization'] = `Bearer ${user.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    const expiredJwtToken = getAxiosInstance().interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.log('error', error);
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      getAxiosInstance().interceptors.request.eject(tokenBearer);
      getAxiosInstance().interceptors.response.eject(expiredJwtToken);
    };
  }, [user]);

  useLayoutEffect(() => {
    const fetchUser = async () => {
      const response = await getUserFromStorage();
      setUser(response);
    };
    fetchUser();
  }, []);

  const login = async (credentials: LoginType) => {
    try {
      const response = await loginAPI(credentials);
      console.log(response);
      setUser(response);
      storeUserInStorage(response);
      return true;
    } catch (e) {
      if (isAxiosError(e)) {
        console.log('axios error');
        addAlert({ message: e.response?.data.error || '', type: 'error' });
      } else {
        const parsedError = ErrorResponseSchema.safeParse(e);
        if (parsedError.success) {
          console.log('parsed error');
          addAlert({ message: parsedError.data.error, type: 'error' });
        } else {
          console.log('error occurred');
          addAlert({ message: 'An unexpected error occurred', type: 'error' });
        }
        throw e;
      }
    }
  };
  const logout = () => {
    setUser(undefined);
    removeUserFromStorage();
  };

  const signup = async (credentials: RegisterType) => {
    try {
      await signupAPI(credentials);
      return true;
    } catch (e) {
      if (isAxiosError(e)) {
        console.log('axios error');
        addAlert({ message: e.response?.data.error || '', type: 'error' });
      } else {
        const parsedError = ErrorResponseSchema.safeParse(e);
        if (parsedError.success) {
          console.log('parsed error');
          addAlert({ message: parsedError.data.error, type: 'error' });
        } else {
          console.log('error occurred');
          addAlert({ message: 'An unexpected error occurred', type: 'error' });
        }
        throw e;
      }
    }
  };
  return { user, login, logout, signup };
};
export default useAuth;
