import { SearchUserSchema, SearchUserType, LoginType, RegisterType } from '@/types';
import {
  ServerRelationType,
  ServerRelationSchema,
  loginReponseSchema,
  registerResponseSchema,
  SyncBatchResponseSchema,
} from '@groceries/shared_types';
import { getAxiosInstance } from '@/service/AxiosInstance';

import Constants from 'expo-constants';
import { PendingOperation } from '@groceries/shared_types';

const getApiUrl = () => {
  // EAS Build - use env variable

  console.log(Constants.expoConfig?.extra);
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig?.extra?.apiUrl;
  }
  if (Constants.expoConfig?.extra?.API_URL) {
    return Constants.expoConfig?.extra?.API_URL;
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Dev: get host from Expo config
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    // Android emulator uses 10.0.2.2 to reach host machine
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://10.0.2.2:3003';
    }
    // Physical device - use the actual dev machine IP
    return `http://${host}:3003`;
  }

  // fallback for Android emulator
  return 'http://10.0.2.2:3003';
};

export const uri = getApiUrl();
export const loginAPI = async (credentials: LoginType) => {
  console.log(credentials);
  console.log(uri);
  const url = uri + '/login';
  const response = await getAxiosInstance().post(url, credentials);
  const parsedResponse = loginReponseSchema.safeParse(response.data);
  if (parsedResponse.success) return parsedResponse.data;
  throw new Error('Something went wrong with response');
};

export const signupAPI = async (credentials: RegisterType) => {
  try {
    console.log('credentials: ', credentials);
    const response = await getAxiosInstance().post(uri + '/signup', credentials);
    const parsedResponse = registerResponseSchema.safeParse(response.data);
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

export const getServerRelations = async (): Promise<ServerRelationType[]> => {
  try {
    const getUrl = uri + '/relations';
    console.log('connecting to server relations', getUrl);
    const response = await getAxiosInstance().get(getUrl);
    console.log(JSON.stringify(response.data, null, 2));
    const parsedResponse = ServerRelationSchema.array().parse(response.data);
    console.log(JSON.stringify(parsedResponse, null, 2));
    return parsedResponse;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const sendSyncOperationsBatch = async (op: PendingOperation[]) => {
  const syncUrl = uri + '/sync/batch';
  const response = await getAxiosInstance().post(syncUrl, op);
  const parsedResponse = SyncBatchResponseSchema.parse(response.data);
  console.log('sendSyncOpreationsBatch', JSON.stringify(parsedResponse, null, 2));
  return parsedResponse;
};
