import { SearchUserSchema, SearchUserType, LoginType, RegisterType } from '@/types';
import {
  ServerRelationType,
  ServerRelationSchema,
  loginReponseSchema,
  registerResponseSchema,
} from '@groceries/shared_types';
import { getAxiosInstance } from '@/service/AxiosInstance';

import Constants from 'expo-constants';
import { PendingOperation } from '@groceries/shared_types';
import z from 'zod';

const getApiUrl = () => {
  // Expo go
  if (Constants.experienceUrl) {
    const host = Constants.experienceUrl.split(':')[1].replace('//', '');
    return `http://${host}:3003`;
  }

  //Expo dev build
  const debuggerHost = Constants.expoConfig?.hostUri;
  console.log(debuggerHost);
  if (debuggerHost) {
    const host = debuggerHost.replace('"', '');
    return `http://${host}:3003`;
  }

  //EAS Build
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // fallback
  return 'http://localhost:3003';
};

export const uri = getApiUrl();
console.log(uri);
export const loginAPI = async (credentials: LoginType) => {
  console.log(credentials);
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
const syncOperationsResultParse = z.object({
  success: z.object({ id: z.string().uuid() }).array(),
  failed: z.object({ id: z.string().uuid(), reason: z.string() }).array(),
});
export const sendSyncOperationsBatch = async (op: PendingOperation[]) => {
  const syncUrl = uri + '/sync/batch';
  const response = await getAxiosInstance().post(syncUrl, op);
  const parsedResponse = syncOperationsResultParse.parse(response.data);
  console.log('sendSyncOpreationsBatch', JSON.stringify(parsedResponse, null, 2));
  return parsedResponse;
};
