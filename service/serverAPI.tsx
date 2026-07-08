import { SearchUserSchema, SearchUserType, LoginType, RegisterType } from '@/types';
import {
  ServerRelationType,
  ServerRelationSchema,
  loginReponseSchema,
  registerResponseSchema,
  SyncBatchResponseSchema,
  LoginResponseType,
} from '@groceries/shared_types';
import { getAxiosInstance } from '@/service/AxiosInstance';

import Constants from 'expo-constants';
import { PendingOperation } from '@groceries/shared_types';
import { isAxiosError } from 'axios';

const getApiUrl = () => {
  // use env variable from eas.json / .env.local works for eas build
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Constants.deviceName?.startsWith('sdk-')) {
    // for Android emulator with local hosted server
    return 'http://10.0.2.2:3003';
  } else {
    //device
    const hostUri = Constants.expoConfig?.hostUri;
    return hostUri ? `http://${hostUri.split(':')[0]}:3003` : 'http://localhost:3003';
  }
};

export const uri = getApiUrl();
console.log(uri);
export const loginAPI = async (credentials: LoginType) => {
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
  try {
    const syncUrl = uri + '/sync/batch';
    const response = await getAxiosInstance().post(syncUrl, op);
    console.log(JSON.stringify(response.data, null, 2));
    const parsedResponse = SyncBatchResponseSchema.parse(response.data);
    return parsedResponse;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export class TokenError extends Error {
  constructor(errorText: string) {
    super(errorText);
    this.name = 'TokenError';
  }
}
export const refreshToken = async (
  refreshToken: Pick<LoginResponseType, 'refreshToken'>
): Promise<LoginResponseType> => {
  try {
    const refreshUrl = uri + '/refresh';
    const response = await getAxiosInstance().post<LoginResponseType>(refreshUrl, refreshToken);
    return response.data;
  } catch (e) {
    if (isAxiosError(e)) {
      if (e.status === 403) {
        throw new TokenError('Refresh token expired');
      }
    }
    throw e;
  }
};
