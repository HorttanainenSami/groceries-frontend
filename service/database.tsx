import axios, { AxiosResponse, AxiosError } from 'axios';
import Constants from "expo-constants";
import { ErrorResponseSchema, LoginResponseSchema, loginResponse} from '../types';
import { LoginType, RegisterType } from '@/types';

const uri = `http:${Constants.experienceUrl.split(':')[1]}:3003`;

const api = axios.create({ baseURL : uri});
//TODO use this interceptor to throw custom errors to determine if server is thrown error or is it axios error
  api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const parse = ErrorResponseSchema.passthrough().safeParse(error.response.data);
      if (error.response.status === 401&& !error.request['_url'].includes('login')){
        console.warn("Unauthorized! Redirecting to login...");
      }else if(parse.success){
        return Promise.reject(parse.data); 
      }
    } else if (error.request) {
      console.error("Network error: No response received");
    } else if(axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
    }
    return Promise.reject(error);
  }
);

export const loginAPI = async (credentials : LoginType)  => {
    console.log(credentials);
    const response = await api.post(uri+'/login', credentials);
    const parsedResponse = LoginResponseSchema.safeParse(response.data);
    if(parsedResponse.success) return parsedResponse.data;

    throw new Error('Something went wrong with response');
};

export const signupAPI = async (credentials: RegisterType) => {
    console.log(credentials);
    const response = await api.post(uri+'/signup', credentials);
    const parsedResponse = LoginResponseSchema.safeParse(response.data);
    if(parsedResponse.success) return parsedResponse.data;
};
