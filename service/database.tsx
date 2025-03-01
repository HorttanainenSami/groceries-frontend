import axios, { AxiosResponse, AxiosError } from 'axios';
import Constants from "expo-constants";
import { TaskRelationsType, ErrorResponseSchema, LoginResponseSchema, loginResponse} from '../types';
import { SearchUsersSchema, SearchUsersType, LoginType, RegisterType } from '@/types';
import AsyncStorage from "@react-native-async-storage/async-storage";

const uri = `http:${Constants.experienceUrl.split(':')[1]}:3003`;

const getToken = async (): Promise<string|null> => {

  const user = await AsyncStorage.getItem('user');
  if(user) return LoginResponseSchema.parse(JSON.parse(user)).token;
  return null
}
const api = axios.create({ baseURL : uri});
//TODO use this interceptor to throw custom errors to determine if server is thrown error or is it axios error
//

api.interceptors.request.use(async request => {
  const accessToken = await getToken();
  if (accessToken) {
    request.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return request;
}, error => {
  return Promise.reject(error);
});

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
  const url = uri+'/login';
  console.log(url);
  const response = await api.post(url,  credentials);
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

export const getFriends = async () => {

};

export const searchUsers= async (searchParams: string): Promise<SearchUsersType[]> => {
  const getUrl = uri+`/user/search?name=${searchParams.toLocaleLowerCase()}`;
  console.log('searching for people from server, ',getUrl);
  const response = await api.get(getUrl);
  console.log('asdasd');
  console.log(response.data);
  const parsedResponse = SearchUsersSchema.array().parse(response.data);
  return parsedResponse;

};
type shareListWithUsersProps = {
  users: SearchUsersType[],
  selectedRelations: TaskRelationsType[],
}
export const shareListWithUser = async ({users, selectedRelations }: shareListWithUsersProps) => {
  //TODO
  console.log('share with ', users, selectedRelations);
}
