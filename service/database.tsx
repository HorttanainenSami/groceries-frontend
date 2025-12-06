import {
  LoginResponseSchema,
  ErrorResponseSchema,
  ServerTaskRelationType,
  ServerTaskRelationSchema,
} from '@/types';
import { SearchUserSchema, SearchUserType, LoginType, RegisterType } from '@/types';
import { getAxiosInstance } from '@/service/AxiosInstance';

//export const uri = 'http://5.61.90.231';
import Constants from 'expo-constants';
export const uri = `http:${Constants.experienceUrl.split(':')[1]}:3003`;

export const loginAPI = async (credentials: LoginType) => {
  try {
    console.log(credentials);
    const url = uri + '/login';
    const response = await getAxiosInstance().post(url, credentials);
    console.log('response ', response);
    const parsedResponse = LoginResponseSchema.safeParse(response.data);
    if (parsedResponse.success) return parsedResponse.data;
    throw new Error('Something went wrong with response');
  } catch (e) {
    console.log('loginAPI catch', e);
    const parsedError = ErrorResponseSchema.safeParse(e);
    if (parsedError.success) {
      console.log('parsed error');
    } else {
      console.log('error occurred', parsedError.data);
    }
    throw e;
  }
};

export const signupAPI = async (credentials: RegisterType) => {
  try {
    console.log('credentials: ', credentials);
    const response = await getAxiosInstance().post(uri + '/signup', credentials);
    const parsedResponse = LoginResponseSchema.safeParse(response.data);
    if (parsedResponse.success) return parsedResponse.data;
  } catch (e) {
    console.error('Error during signup:', e);
    throw e;
  }
};

const buildQueryString = (baseUrl: string, params: Record<string, string | undefined>): string => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.append(key, value);
    }
  });

  return `${baseUrl}?${query.toString()}`;
};

export const searchUsers = async (
  searchParams: string,
  friends?: boolean
): Promise<SearchUserType[]> => {
  try {
    const baseUrl = uri + `/user/search`;
    const url = buildQueryString(baseUrl, {
      name: searchParams,
      friends: friends ? 'true' : undefined,
    });
    console.log('url', url);
    const response = await getAxiosInstance().get(url);
    const parsedResponse = SearchUserSchema.array().parse(response.data);
    return parsedResponse;
  } catch (e) {
    console.error('Error searching users:', e);
    if (e instanceof Error) {
      console.error('Error message:', e.message);
    }
    throw e;
  }
};

export const getServerRelations = async (): Promise<ServerTaskRelationType[]> => {
  try {
    const getUrl = uri + '/relations';
    console.log('connecting to server relations', getUrl);
    const response = await getAxiosInstance().get(getUrl);
    console.log(JSON.stringify(response.data, null, 2));
    const parsedResponse = ServerTaskRelationSchema.array().parse(response.data);
    console.log(JSON.stringify(parsedResponse, null, 2));
    return parsedResponse;
  } catch (e) {
    console.log(e);
    return [];
  }
};
